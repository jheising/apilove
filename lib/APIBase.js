"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const lodash_1 = require("lodash");
require("reflect-metadata");
const Utils_1 = require("./Utils");
const APIConfig_1 = require("./APIConfig");
const shortid = require("shortid");
const url_1 = require("url");
function APIParameter(options) {
    return function (target, key, parameterIndex) {
        let handlerData = lodash_1.get(target.constructor.prototype, `__handlerData.${key.toString()}`, {});
        lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramOptions`, options);
        lodash_1.set(target.constructor.prototype, `__handlerData.${key.toString()}`, handlerData);
    };
}
exports.APIParameter = APIParameter;
function APIEndpoint(options) {
    return function (target, key, descriptor) {
        options = lodash_1.defaults({}, options, {
            method: "get",
            path: "/"
        });
        let handlerData = lodash_1.get(target.constructor.prototype, `__handlerData.${key.toString()}`, {});
        handlerData.handlerFunction = descriptor.value;
        handlerData.options = options;
        let parameterMetadata = Reflect.getMetadata("design:paramtypes", target, key);
        let parameterNames = Utils_1.Utils.getFunctionParamNames(descriptor.value);
        handlerData.handlerParameterNames = parameterNames;
        for (let parameterIndex = 0; parameterIndex < parameterNames.length; parameterIndex++) {
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, Utils_1.Utils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            lodash_1.set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }
        lodash_1.set(target.constructor.prototype, `__handlerData.${key.toString()}`, handlerData);
    };
}
exports.APIEndpoint = APIEndpoint;
class APIError {
    constructor(friendlyMessage, rawError, statusCode = 500, extraData) {
        this.id = shortid.generate();
        // Is this already and API friendly error?
        if (rawError && "isAPIFriendly" in rawError) {
            this.friendlyMessage = rawError.message;
            this.statusCode = rawError.statusCode;
        }
        else {
            this.friendlyMessage = friendlyMessage;
            this.statusCode = statusCode;
        }
        this.rawError = rawError;
        this.extraData = extraData;
    }
    static shouldReject(error, rejectFunction) {
        if (!lodash_1.isNil(error)) {
            if (rejectFunction) {
                rejectFunction(error);
            }
            return true;
        }
        return false;
    }
    static createValidationError(errors) {
        return new APIError("validation_error", null, 400, errors);
    }
    static create404NotFoundError() {
        return APIError.createAPIFriendlyError("not found", 404);
    }
    static create401UnauthorizedError() {
        return APIError.createAPIFriendlyError("unauthorized", 401);
    }
    static createAPIFriendlyError(message, statusCode = 500) {
        let error = new Error(message);
        error.isAPIFriendly = true;
        error.statusCode = statusCode;
        return error;
    }
    static _rawErrorOut(error) {
        //stack = stack.split('\n').map(function (line) { return line.trim(); });
        let errorData = {
            "error": error.toString()
        };
        let stack = error.stack;
        if (stack) {
            errorData.stack = stack.split('\n').map(function (line) {
                return line.trim();
            }).slice(1);
        }
        return errorData;
    }
    out(includeRawError = APIConfig_1.APIConfig.DISPLAY_RAW_ERRORS) {
        let output = {
            "error": {
                "id": this.id,
                "message": this.friendlyMessage,
                "details": this.extraData,
            }
        };
        if (includeRawError && !lodash_1.isNil(this.rawError)) {
            output.error.raw_error = APIError._rawErrorOut(this.rawError);
        }
        return output;
    }
    hapiOut(includeRawError = APIConfig_1.APIConfig.DISPLAY_RAW_ERRORS) {
        let output = {
            "this": "failed",
            "with": this.statusCode,
            "because": {
                "message": this.friendlyMessage,
                "details": this.extraData
            },
            "id": this.id
        };
        if (includeRawError && !lodash_1.isNil(this.rawError)) {
            output.because.raw_error = APIError._rawErrorOut(this.rawError);
        }
        return output;
    }
}
exports.APIError = APIError;
class APIResponse {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    static withError(req, res, error, hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS) {
        return new APIResponse(req, res).withError(error, hapiOutput);
    }
    processHandlerFunction(target, handlerFunction, handlerArgs = [], successResponseHandler) {
        // Add the req, and res to the end arguments if the function wants it
        handlerArgs = handlerArgs.concat([this.req, this.res]);
        let handlerPromise = handlerFunction.apply(target, handlerArgs);
        if (!(handlerPromise instanceof Promise)) {
            throw new Error(`API function named '${handlerFunction.name}' doesn't return a promise.`);
        }
        else {
            handlerPromise.then((data) => {
                // If the data is a URL, consider this a redirect.
                if (data instanceof url_1.URL) {
                    this.res.redirect(data.toString());
                    return;
                }
                if (!lodash_1.isNil(successResponseHandler)) {
                    successResponseHandler(data, this.res);
                }
                else {
                    this.withSuccess(data, 200);
                }
            }).catch((error) => {
                this.withError(error);
            });
        }
    }
    withError(error, hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS) {
        if (lodash_1.isNil(error)) {
            return false;
        }
        let apiError;
        if (error instanceof APIError) {
            apiError = error;
        }
        else {
            apiError = new APIError("unknown", error);
        }
        if ((apiError.statusCode >= 500 && apiError.statusCode <= 599 && APIConfig_1.APIConfig.LOG_500_ERRORS) ||
            (apiError.statusCode >= 400 && apiError.statusCode <= 499 && APIConfig_1.APIConfig.LOG_400_ERRORS)) {
            console.error(JSON.stringify(apiError.out(true)));
        }
        this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
    }
    withSuccess(data, statusCode = 200, hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS) {
        let output = data;
        if (hapiOutput) {
            output = {
                "this": "succeeded",
                "with": data
            };
        }
        this.res.status(statusCode).send(output);
    }
}
exports.APIResponse = APIResponse;
class APIBase {
    constructor() {
        this.app = express.Router();
        lodash_1.each(this.constructor.prototype.__handlerData, (handlerData) => {
            let options = handlerData.options;
            let argsArray = [options.path];
            if (options.middleware) {
                argsArray = argsArray.concat(lodash_1.castArray(options.middleware));
            }
            let handlerWrapper = this._createHandlerWrapperFunction(handlerData);
            argsArray.push(handlerWrapper);
            this.app[options.method.toLowerCase()].apply(this.app, argsArray);
        });
    }
    _createHandlerWrapperFunction(handlerData) {
        return (req, res) => {
            let apiResponse = new APIResponse(req, res);
            let handlerArgs = [];
            let validationErrors = [];
            // Loop through each parameter in our function and pull it from the request
            for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
                let paramData = handlerData.handlerParameterData[index];
                let paramOptions = lodash_1.get(paramData, "paramOptions", {});
                let paramName = Utils_1.Utils.coalesce(paramOptions.rawName, handlerData.handlerParameterNames[index]);
                // Ignore request and response parameters if the function asks for it
                if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                    continue;
                }
                let paramSources = lodash_1.castArray(lodash_1.get(paramOptions, "sources", ["any"]));
                let paramValue;
                if (paramSources.indexOf("body") !== -1) {
                    let bodyValue = req.body;
                    if (!lodash_1.isNil(bodyValue)) {
                        paramValue = bodyValue;
                    }
                }
                else {
                    for (let paramSource of paramSources) {
                        if (paramSource === "any") {
                            paramValue = Utils_1.Utils.coalesce(lodash_1.get(req, "params", {})[paramName], lodash_1.get(req, "query", {})[paramName], lodash_1.get(req, "cookie", {})[paramName], req.header(paramName));
                        }
                        else {
                            paramValue = lodash_1.get(req, paramSource);
                        }
                        if (!lodash_1.isNil(paramValue)) {
                            break;
                        }
                    }
                }
                let argValue = Utils_1.Utils.coalesce(paramValue, paramOptions.defaultValue);
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
                argValue = Utils_1.Utils.convertToType(argValue, paramData.paramType);
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
                apiResponse.withError(APIError.createValidationError(validationErrors));
                return;
            }
            apiResponse.processHandlerFunction(this, handlerData.handlerFunction, handlerArgs, handlerData.options.successResponse);
        };
    }
}
exports.APIBase = APIBase;
//# sourceMappingURL=APIBase.js.map