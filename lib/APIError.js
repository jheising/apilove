"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIConfig_1 = require("./APIConfig");
var shortid = require("shortid");
var lodash_1 = require("lodash");
var APIError = /** @class */ (function () {
    function APIError(friendlyMessage, rawError, statusCode, extraData) {
        if (statusCode === void 0) { statusCode = 500; }
        this.id = shortid.generate();
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
    APIError.shouldReject = function (error, rejectFunction) {
        if (!lodash_1.isNil(error)) {
            if (rejectFunction) {
                rejectFunction(error);
            }
            return true;
        }
        return false;
    };
    APIError.createValidationError = function (errors) {
        return new APIError("validation_error", null, 400, errors);
    };
    APIError.create404NotFoundError = function () {
        return APIError.createAPIFriendlyError("not found", 404);
    };
    APIError.create401UnauthorizedError = function () {
        return APIError.createAPIFriendlyError("unauthorized", 401);
    };
    APIError.createAPIFriendlyError = function (message, statusCode) {
        if (statusCode === void 0) { statusCode = 500; }
        var error = new Error(message);
        error.isAPIFriendly = true;
        error.statusCode = statusCode;
        return error;
    };
    APIError._rawErrorOut = function (error) {
        var errorData = {
            "error": error.toString()
        };
        var stack = error.stack;
        if (stack) {
            errorData.stack = stack.split('\n').map(function (line) {
                return line.trim();
            }).slice(1);
        }
        return errorData;
    };
    APIError.prototype.out = function (includeRawError) {
        if (includeRawError === void 0) { includeRawError = APIConfig_1.APIConfig.DISPLAY_RAW_ERRORS; }
        var output = {
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
    };
    APIError.prototype.hapiOut = function (includeRawError) {
        if (includeRawError === void 0) { includeRawError = APIConfig_1.APIConfig.DISPLAY_RAW_ERRORS; }
        var output = {
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
    };
    return APIError;
}());
exports.APIError = APIError;
//# sourceMappingURL=APIError.js.map