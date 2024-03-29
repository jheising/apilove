"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvVarSync = exports.APIFileService = exports.APIKVService = exports.APIUtils = exports.APIResponse = exports.APIError = exports.APIAuthUtils = exports.APIConfig = exports.APIEndpoint = exports.APIParameter = exports.APILove = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const lodash_1 = require("lodash");
const APIConfig_1 = require("./lib/APIConfig");
Object.defineProperty(exports, "APIConfig", { enumerable: true, get: function () { return APIConfig_1.APIConfig; } });
const path_1 = __importDefault(require("path"));
const APIUtils_1 = require("./lib/APIUtils");
Object.defineProperty(exports, "APIUtils", { enumerable: true, get: function () { return APIUtils_1.APIUtils; } });
require("reflect-metadata");
const APIResponse_1 = require("./lib/APIResponse");
Object.defineProperty(exports, "APIResponse", { enumerable: true, get: function () { return APIResponse_1.APIResponse; } });
const APIError_1 = require("./lib/APIError");
Object.defineProperty(exports, "APIError", { enumerable: true, get: function () { return APIError_1.APIError; } });
const KVService_1 = require("./lib/Services/KeyValue/KVService");
Object.defineProperty(exports, "APIKVService", { enumerable: true, get: function () { return KVService_1.KVService; } });
const FileService_1 = require("./lib/Services/File/FileService");
Object.defineProperty(exports, "APIFileService", { enumerable: true, get: function () { return FileService_1.FileService; } });
const Config_1 = require("./lib/Services/Config");
Object.defineProperty(exports, "EnvVarSync", { enumerable: true, get: function () { return Config_1.EnvVarSync; } });
const APIAuthUtils_1 = require("./lib/APIAuthUtils");
Object.defineProperty(exports, "APIAuthUtils", { enumerable: true, get: function () { return APIAuthUtils_1.APIAuthUtils; } });
function _createHandlerWrapperFunction(handlerData, thisObject) {
    return (req, res, next) => {
        let apiResponse = new APIResponse_1.APIResponse(req, res, next);
        // Does this require authentication?
        if (handlerData.options.requireAuthentication) {
            if (!req.auth || !req.auth.isAuthenticated || req.auth.isExpired) {
                apiResponse.withError(APIError_1.APIError.create401UnauthorizedError());
                return;
            }
        }
        let handlerArgs = [];
        let validationErrors = [];
        // Loop through each parameter in our function and pull it from the request
        for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
            let paramData = handlerData.handlerParameterData[index];
            let paramOptions = lodash_1.get(paramData, "paramOptions", {});
            let paramName = APIUtils_1.APIUtils.coalesce(paramOptions.rawName, handlerData.handlerParameterNames[index]);
            // Ignore request and response parameters if the function asks for it
            if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                continue;
            }
            let paramSources = lodash_1.castArray(lodash_1.get(paramOptions, "sources", ["params", "query", "body", "cookie", "headers"]));
            let paramValue;
            if (req.auth && paramData.paramType === "APIAuthUser") {
                paramValue = APIAuthUtils_1.APIAuthUtils.getAPIAuthUserFromAuthCredentials(req.auth);
            }
            else {
                for (let paramSource of paramSources) {
                    let paramValues = lodash_1.get(req, paramSource);
                    if (lodash_1.isNil(paramValues)) {
                        continue;
                    }
                    if (paramOptions.includeFullSource ||
                        (/[\.\[\]]/g).test(paramSource) // If the source contains any of the characters ".[]" (ie a path), assume the developer meant to include the full source.
                    ) {
                        paramValue = paramValues;
                        break;
                    }
                    else {
                        if (lodash_1.has(paramValues, paramName)) {
                            paramValue = paramValues[paramName];
                            break;
                        }
                    }
                }
            }
            let argValue = APIUtils_1.APIUtils.coalesce(paramValue, paramOptions.defaultValue);
            if (paramOptions.processor) {
                try {
                    argValue = paramOptions.processor(argValue, req);
                }
                catch (error) {
                    validationErrors.push({
                        parameter: paramName,
                        message: error.message || error.toString()
                    });
                    continue;
                }
            }
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
            argValue = APIUtils_1.APIUtils.convertToType(argValue, paramData.paramRawType);
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
        apiResponse.processHandlerFunction(thisObject, handlerData.handlerFunction, handlerArgs, handlerData.options.disableFriendlyResponse, handlerData.options.successResponse);
    };
}
function _loadAPI(apiRouter, apiDefinition) {
    let apiClass;
    if (lodash_1.isFunction(apiDefinition.require)) {
        apiClass = apiDefinition.require();
    }
    else {
        let apiModule;
        try {
            apiModule = require(path_1.default.resolve(process.cwd(), apiDefinition.require));
        }
        catch (e) {
            console.error(e);
            return null;
        }
        if (lodash_1.isNil(apiModule)) {
            return null;
        }
        let moduleName = APIUtils_1.APIUtils.coalesce(apiDefinition.moduleName, path_1.default.basename(apiDefinition.require));
        apiClass = APIUtils_1.APIUtils.coalesce(apiModule[moduleName], apiModule.default, apiModule);
    }
    let apiInstance;
    lodash_1.each(lodash_1.get(apiClass, "__handlerData", {}), (handlerData, name) => {
        // If this is an instance function, we need to create an instance of the class
        if (handlerData.isInstance && lodash_1.isNil(apiInstance)) {
            apiInstance = new apiClass();
        }
        let options = handlerData.options;
        let argsArray = [options.path];
        if (options.middleware) {
            argsArray = argsArray.concat(lodash_1.castArray(options.middleware));
        }
        let handlerWrapper = _createHandlerWrapperFunction(handlerData, handlerData.isInstance ? apiInstance : apiClass);
        argsArray.push(handlerWrapper);
        apiRouter[options.method.toLowerCase()].apply(apiRouter, argsArray);
    });
}
class APILove {
    static start(options) {
        if (options.loadStandardMiddleware !== false) {
            this.app.use(cookie_parser_1.default());
            this.app.use(body_parser_1.default.json({ limit: "50mb" }));
            this.app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 }));
            this.app.use(body_parser_1.default.text({ limit: "50mb" }));
            this.app.use((req, res, next) => {
                req.auth = APIAuthUtils_1.APIAuthUtils.getAuthCredentialsFromRequest(req, true);
                next();
            });
        }
        for (let mw of lodash_1.get(options, "middleware", [])) {
            this.app.use(mw);
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
                        apiRouter = express_1.default.Router();
                        _loadAPI(apiRouter, api);
                    }
                    apiRouter(req, res, next);
                });
            }
            else {
                let apiRouter = express_1.default.Router();
                _loadAPI(apiRouter, api);
                this.app.use(api.apiPath, apiRouter);
            }
        }
        if (!lodash_1.isNil(options.defaultRouteHandler)) {
            this.app.use(options.defaultRouteHandler);
        }
        // Setup our default error handler
        if (!lodash_1.isNil(options.defaultErrorHandler)) {
            this.app.use(options.defaultErrorHandler);
        }
        else {
            this.app.use((error, req, res, next) => {
                if (error instanceof APIError_1.APIError) {
                    let apiError = error;
                    res.status(apiError.statusCode).send(APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS ? apiError.hapiOut() : apiError.out());
                }
                else {
                    let apiResponse = new APIResponse_1.APIResponse(res, res);
                    apiResponse.withError(error);
                }
            });
        }
        if (APIConfig_1.APIConfig.RUN_AS_SERVER) {
            this.app.listen(APIConfig_1.APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig_1.APIConfig.WEB_PORT}`));
            return this.app;
        }
        else {
            let serverless = require("serverless-http");
            return serverless(this.app, { callbackWaitsForEmptyEventLoop: !!options.callbackWaitsForEmptyEventLoop });
        }
    }
}
exports.APILove = APILove;
APILove.app = express_1.default();
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
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramRawType`, APIUtils_1.APIUtils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, parameterMetadata[parameterIndex].name);
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }
        lodash_1.set(theClass, `__handlerData.${key}`, handlerData);
    };
}
exports.APIEndpoint = APIEndpoint;
//# sourceMappingURL=APILove.js.map