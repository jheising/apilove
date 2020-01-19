"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const APIConfig_1 = require("./APIConfig");
const APIError_1 = require("./APIError");
const lodash_1 = require("lodash");
const url_1 = require("url");
class APIResponse {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
    static withError(req, res, error, hapiOutput = APIConfig_1.APIConfig.OUTPUT_HAPI_RESULTS) {
        return new APIResponse(req, res).withError(error, hapiOutput);
    }
    processHandlerFunction(target, handlerFunction, handlerArgs = [], disableFriendlyResponse, successResponseHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            // Add the req, and res to the end arguments if the function wants it
            handlerArgs = handlerArgs.concat([this.req, this.res]);
            let handlerData;
            try {
                const handlerOutput = handlerFunction.apply(target, handlerArgs);
                if (!(handlerOutput instanceof Promise)) {
                    handlerData = handlerOutput;
                }
                else {
                    handlerData = yield handlerOutput;
                }
            }
            catch (error) {
                this.withError(error);
            }
            // If the data is a URL, consider this a redirect.
            if (handlerData instanceof url_1.URL) {
                this.res.redirect(handlerData.toString());
                return;
            }
            if (disableFriendlyResponse) {
                this.res.json(handlerData);
            }
            else if (!lodash_1.isNil(successResponseHandler)) {
                successResponseHandler(handlerData, this.res);
            }
            else {
                this.withSuccess(handlerData, 200);
            }
        });
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
        if (this.next) {
            // Let the standard error handler handle it
            this.next(apiError);
        }
        else {
            this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
        }
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