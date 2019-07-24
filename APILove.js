"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const lodash_1 = require("lodash");
const APIConfig_1 = require("./lib/APIConfig");
exports.APIConfig = APIConfig_1.APIConfig;
const path = require("path");
const APIUtils_1 = require("./lib/APIUtils");
exports.APIUtils = APIUtils_1.APIUtils;
require("reflect-metadata");
const APIResponse_1 = require("./lib/APIResponse");
exports.APIResponse = APIResponse_1.APIResponse;
const APIError_1 = require("./lib/APIError");
exports.APIError = APIError_1.APIError;
const KVService_1 = require("./lib/Services/KeyValue/KVService");
exports.APIKVService = KVService_1.KVService;
const FileService_1 = require("./lib/Services/File/FileService");
exports.APIFileService = FileService_1.FileService;
const Config_1 = require("./lib/Services/Config");
exports.EnvVarSync = Config_1.EnvVarSync;
function _createHandlerWrapperFunction(handlerData, thisObject) {
    return (req, res, next) => {
        let apiResponse = new APIResponse_1.APIResponse(req, res, next);
        let handlerArgs = [];
        let validationErrors = [];
        // Loop through each parameter in our function and pull it from the request
        for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
            let paramData = handlerData.handlerParameterData[index];
            let paramOptions = lodash_1.get(paramData, "paramOptions", {});
            let paramName = handlerData.handlerParameterNames[index];
            // Ignore request and response parameters if the function asks for it
            if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                continue;
            }
            let paramSources = lodash_1.castArray(lodash_1.get(paramOptions, "sources", ["params", "query", "body", "cookie", "headers"]));
            let paramValue;
            for (let paramSource of paramSources) {
                let paramValues = lodash_1.get(req, paramSource);
                if (lodash_1.isNil(paramValues)) {
                    continue;
                }
                if (lodash_1.has(paramValues, paramName)) {
                    paramValue = paramValues[paramName];
                    break;
                }
            }
            let argValue = APIUtils_1.APIUtils.coalesce(paramValue, paramOptions.defaultValue);
            if (lodash_1.isNil(argValue)) {
                // Is this parameter required?
                if (!lodash_1.get(paramOptions, "optional", false)) {
                    validationErrors.push({
                        parameter: paramName,
                        message: "missing"
                    });
                }
                handlerArgs.push(undefined);
                continue;
            }
            argValue = APIUtils_1.APIUtils.convertToType(argValue, paramData.paramType);
            if (lodash_1.isNil(argValue) || lodash_1.isNaN(argValue)) {
                validationErrors.push({
                    parameter: paramName,
                    message: "invalid"
                });
                continue;
            }
            handlerArgs.push(argValue);
        }
        if (validationErrors.length > 0) {
            apiResponse.withError(APIError_1.APIError.createValidationError(validationErrors));
            return;
        }
        apiResponse.processHandlerFunction(thisObject, handlerData.handlerFunction, handlerArgs);
    };
}
function _getAPIModule(apiDefinition) {
    let apiModule;
    try {
        apiModule = require(path.resolve(process.cwd(), apiDefinition.require));
    }
    catch (e) {
        console.error(e);
        return null;
    }
    if (lodash_1.isNil(apiModule)) {
        return null;
    }
    let moduleName = APIUtils_1.APIUtils.coalesce(apiDefinition.moduleName, path.basename(apiDefinition.require));
    return APIUtils_1.APIUtils.coalesce(apiModule[moduleName], apiModule.default, apiModule);
}
function _loadAPI(apiRouter, apiDefinition) {
    let apiModule = _getAPIModule(apiDefinition);
    if (lodash_1.isNil(apiModule)) {
        return null;
    }
    let apiInstance;
    lodash_1.each(lodash_1.get(apiModule, "__handlerData", {}), (handlerData, name) => {
        // If this is an instance function, we need to create an instance of the class
        if (handlerData.isInstance && lodash_1.isNil(apiInstance)) {
            apiInstance = new apiModule();
        }
        let options = handlerData.options;
        let argsArray = [options.path];
        if (options.middleware) {
            argsArray = argsArray.concat(lodash_1.castArray(options.middleware));
        }
        let handlerWrapper = _createHandlerWrapperFunction(handlerData, handlerData.isInstance ? apiInstance : apiModule);
        argsArray.push(handlerWrapper);
        apiRouter[options.method.toLowerCase()].apply(apiRouter, argsArray);
    });
}
class APILove {
    static getAPIMetadata(options) {
        let metaData = [];
        for (let api of lodash_1.get(options, "apis", [])) {
            let apiModule = _getAPIModule(api);
            let apiEndpoints = [];
            lodash_1.each(lodash_1.get(apiModule, "__handlerData", {}), (endpoint) => {
                apiEndpoints.push(endpoint.options);
            });
            metaData.push({
                apiOptions: lodash_1.get(apiModule, "__apiOptions", {}),
                path: api.apiPath,
                endpointOptions: apiEndpoints
            });
        }
        return metaData;
    }
    static start(options) {
        lodash_1.defaultsDeep(options, {
            generateDocs: true
        });
        if (options.loadStandardMiddleware !== false) {
            this.app.use(cookieParser());
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: false }));
            this.app.use(bodyParser.text());
        }
        this.app.use((req, res, next) => {
            req.APILove = {
                options: options
            };
            next();
        });
        if (options.generateDocs) {
            options.apis = [{
                    apiPath: "/",
                    require: "lib/APIDocs"
                }].concat(options.apis);
        }
        // Here we load our APIs, but we only load them when requested
        for (let api of lodash_1.get(options, "apis", [])) {
            if (lodash_1.isNil(api.apiPath)) {
                api.apiPath = "";
            }
            if (APIConfig_1.APIConfig.LAZY_LOAD_APIS) {
                let apiRouter;
                this.app.use(api.apiPath, (req, res, next) => {
                    // Lazy load our API
                    if (!apiRouter) {
                        apiRouter = express.Router();
                        _loadAPI(apiRouter, api);
                    }
                    apiRouter(req, res, next);
                });
            }
            else {
                let apiRouter = express.Router();
                _loadAPI(apiRouter, api);
                this.app.use(api.apiPath, apiRouter);
            }
        }
        if (APIConfig_1.APIConfig.RUN_AS_SERVER) {
            this.app.listen(APIConfig_1.APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig_1.APIConfig.WEB_PORT}`));
            return this.app;
        }
        else {
            let serverless = require("serverless-http");
            return serverless(this.app, { callbackWaitsForEmptyEventLoop: true });
        }
    }
}
APILove.app = express();
exports.APILove = APILove;
function APIParameter(options) {
    return function (target, key, parameterIndex) {
        let isInstance = lodash_1.isNil(target.prototype);
        let theClass = isInstance ? target.constructor : target.prototype.constructor;
        let handlerData = lodash_1.get(theClass, `__handlerData.${key}`, {});
        lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramOptions`, options);
        lodash_1.set(theClass, `__handlerData.${key}`, handlerData);
    };
}
exports.APIParameter = APIParameter;
function APIEndpoint(options) {
    return function (target, key, descriptor) {
        let isInstance = lodash_1.isNil(target.prototype);
        let theClass = isInstance ? target.constructor : target.prototype.constructor;
        let handlerData = lodash_1.get(theClass, `__handlerData.${key}`, {});
        options = lodash_1.defaultsDeep({}, options, {
            method: "get",
            path: "/"
        });
        let parameterMetadata = Reflect.getMetadata("design:paramtypes", target, key);
        let parameterNames = APIUtils_1.APIUtils.getFunctionParamNames(descriptor.value);
        handlerData.isInstance = isInstance;
        handlerData.handlerFunction = descriptor.value;
        handlerData.options = options;
        handlerData.handlerParameterNames = parameterNames;
        for (let parameterIndex = 0; parameterIndex < parameterNames.length; parameterIndex++) {
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, APIUtils_1.APIUtils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }
        lodash_1.set(theClass, `__handlerData.${key}`, handlerData);
    };
}
exports.APIEndpoint = APIEndpoint;
function API(options) {
    return function (constructor) {
        lodash_1.set(constructor, `__apiOptions`, options);
    };
}
exports.API = API;
//# sourceMappingURL=APILove.js.map