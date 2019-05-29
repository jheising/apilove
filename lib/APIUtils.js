"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var getArguments = require("function-arguments");
var APIConfig_1 = require("./APIConfig");
var crypto = require("crypto");
var slugify_1 = require("slugify");
slugify_1.default.extend({ "/": ":" });
var APIUtils = /** @class */ (function () {
    function APIUtils() {
    }
    APIUtils.getRawTypeName = function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    };
    APIUtils.convertToType = function (value, convertToType) {
        if (lodash_1.isNil(convertToType)) {
            return value;
        }
        var convertedValue;
        var rawValueType = APIUtils.getRawTypeName(value);
        // No conversion needed
        if (rawValueType === convertToType) {
            return value;
        }
        // Objects and Arrays can only be converted to JSON strings
        if (rawValueType === "Object" || rawValueType === "Array") {
            if (convertToType === "String") {
                try {
                    return JSON.stringify(value);
                }
                catch (e) {
                }
            }
            return undefined;
        }
        switch (convertToType) {
            case "String": {
                convertedValue = lodash_1.toString(value);
                break;
            }
            case "Boolean": {
                convertedValue = APIUtils.toBoolean(value);
                break;
            }
            case "Number": {
                convertedValue = lodash_1.toNumber(value);
                break;
            }
            case "Array": {
                convertedValue = lodash_1.castArray(value);
                break;
            }
            case "Object": {
                try {
                    convertedValue = JSON.parse(value);
                }
                catch (e) {
                    convertedValue = value;
                }
            }
        }
        return convertedValue;
    };
    APIUtils.toBoolean = function (input) {
        if (lodash_1.isBoolean(input)) {
            return input;
        }
        return (/(1|true|yes)/i).test(input);
    };
    APIUtils.coalesce = function () {
        var inputArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputArgs[_i] = arguments[_i];
        }
        for (var _a = 0, inputArgs_1 = inputArgs; _a < inputArgs_1.length; _a++) {
            var inputArg = inputArgs_1[_a];
            // Consider an empty string as a null value
            if (lodash_1.isNil(inputArg) || (lodash_1.isString(inputArg) && inputArg === "")) {
                continue;
            }
            return inputArg;
        }
        return null;
    };
    APIUtils.getFunctionParamNames = function (fn) {
        return getArguments(fn);
    };
    APIUtils.encrypt = function (text, password) {
        if (password === void 0) { password = APIConfig_1.APIConfig.ENCRYPTION_SECRET; }
        var iv = crypto.randomBytes(this._IV_LENGTH);
        var cipher = crypto.createCipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        var encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('base64') + ':' + encrypted.toString('base64');
    };
    APIUtils.decrypt = function (text, password) {
        if (password === void 0) { password = APIConfig_1.APIConfig.ENCRYPTION_SECRET; }
        var textParts = text.split(':');
        var iv = Buffer.from(textParts.shift(), 'base64');
        var encryptedText = Buffer.from(textParts.join(':'), 'base64');
        var decipher = crypto.createDecipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        var decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    };
    APIUtils.slugify = function (text) {
        return slugify_1.default(text);
    };
    APIUtils.hashString = function (text) {
        var shasum = crypto.createHash(this._HASH_ALG);
        shasum.update(text);
        return shasum.digest('base64');
    };
    APIUtils.hashMD5 = function (text) {
        var md5 = crypto.createHash('md5');
        md5.update(text);
        return md5.digest('base64');
    };
    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    APIUtils.createExpirationInSeconds = function (expirationInSeconds) {
        return Math.floor(Date.now() / 1000) + expirationInSeconds;
    };
    APIUtils._IV_LENGTH = 16;
    APIUtils._CRYPTO_ALG = 'aes-256-cbc';
    APIUtils._HASH_ALG = 'sha256';
    return APIUtils;
}());
exports.APIUtils = APIUtils;
//# sourceMappingURL=APIUtils.js.map