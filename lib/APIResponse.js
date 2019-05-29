"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIConfig_1 = require("./APIConfig");
var APIError_1 = require("./APIError");
var lodash_1 = require("lodash");
var url_1 = require("url");
var APIResponse = /** @class */ (function () {
    function APIResponse(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
    APIResponse.withError = function (req, res, error, hapiOutput) {
        if (hapiOutput === void 0) { hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS; }
        return new APIResponse(req, res).withError(error, hapiOutput);
    };
    APIResponse.prototype.processHandlerFunction = function (target, handlerFunction, handlerArgs, successResponseHandler) {
        var _this = this;
        if (handlerArgs === void 0) { handlerArgs = []; }
        // Add the req, and res to the end arguments if the function wants it
        handlerArgs = handlerArgs.concat([this.req, this.res]);
        var handlerPromise = handlerFunction.apply(target, handlerArgs);
        if (!(handlerPromise instanceof Promise)) {
            throw new Error("API function named '" + handlerFunction.name + "' doesn't return a promise.");
        }
        else {
            handlerPromise.then(function (data) {
                // If the data is a URL, consider this a redirect.
                if (data instanceof url_1.URL) {
                    _this.res.redirect(data.toString());
                    return;
                }
                if (!lodash_1.isNil(successResponseHandler)) {
                    successResponseHandler(data, _this.res);
                }
                else {
                    _this.withSuccess(data, 200);
                }
            }).catch(function (error) {
                _this.withError(error);
            });
        }
    };
    APIResponse.prototype.withError = function (error, hapiOutput) {
        if (hapiOutput === void 0) { hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS; }
        if (this.res.headersSent || lodash_1.isNil(error)) {
            return;
        }
        var apiError;
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
        if (this.next) {
            // Let the standard error handler handle it
            this.next(apiError);
        }
        else {
            this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
        }
    };
    APIResponse.prototype.withSuccess = function (data, statusCode, hapiOutput) {
        if (statusCode === void 0) { statusCode = 200; }
        if (hapiOutput === void 0) { hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS; }
        if (this.res.headersSent) {
            return;
        }
        var output = data;
        if (hapiOutput) {
            output = {
                "this": "succeeded",
                "with": data
            };
        }
        this.res.status(statusCode).send(output);
    };
    return APIResponse;
}());
exports.APIResponse = APIResponse;
//# sourceMappingURL=APIResponse.js.map