"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIConfig_1 = require("./APIConfig");
const APIError_1 = require("./APIError");
const lodash_1 = require("lodash");
const url_1 = require("url");
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
        if (this.res.headersSent || lodash_1.isNil(error)) {
            return;
        }
        let apiError;
        if (error instanceof APIError_1.APIError) {
            apiError = error;
        }
        else {
            apiError = new APIError_1.APIError("unknown", error);
        }
        if ((apiError.statusCode >= 500 && apiError.statusCode <= 599 && APIConfig_1.APIConfig.LOG_500_ERRORS) ||
            (apiError.statusCode >= 400 && apiError.statusCode <= 499 && APIConfig_1.APIConfig.LOG_400_ERRORS)) {
            console.error(JSON.stringify(apiError.out(true)));
        }
        this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
    }
    withSuccess(data, statusCode = 200, hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS) {
        if (this.res.headersSent) {
            return;
        }
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
//# sourceMappingURL=APIResponse.js.map