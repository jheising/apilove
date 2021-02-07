"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
const APIConfig_1 = require("./APIConfig");
const shortid_1 = __importDefault(require("shortid"));
const lodash_1 = require("lodash");
class APIError {
    constructor(friendlyMessage, rawError, statusCode = 500, extraData) {
        this.id = shortid_1.default.generate();
        // Is this already and API friendly error?
        if (lodash_1.get(rawError, "isAPIFriendly", false)) {
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
        let errorData = {
            "error": error
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
//# sourceMappingURL=APIError.js.map