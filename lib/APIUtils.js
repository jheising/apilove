"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const function_arguments_1 = __importDefault(require("function-arguments"));
const APIConfig_1 = require("./APIConfig");
const crypto_1 = __importDefault(require("crypto"));
const slugify_1 = __importDefault(require("slugify"));
const shortid_1 = __importDefault(require("shortid"));
const nanoid_1 = require("nanoid");
const safe_base64_1 = require("safe-base64");
slugify_1.default.extend({ "/": ":" });
class APIUtils {
    static getRawTypeName(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }
    static generateShortID() {
        return shortid_1.default.generate();
    }
    static generateLongID(length) {
        return nanoid_1.nanoid(length);
    }
    static slugify(text) {
        return slugify_1.default(text);
    }
    static convertToType(value, convertToType) {
        if (lodash_1.isNil(convertToType)) {
            return value;
        }
        let convertedValue;
        let rawValueType = APIUtils.getRawTypeName(value);
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
    }
    static toBoolean(input) {
        if (lodash_1.isBoolean(input)) {
            return input;
        }
        return (/(1|true|yes)/i).test(input);
    }
    static coalesce(...inputArgs) {
        for (let inputArg of inputArgs) {
            // Consider an empty string as a null value
            if (lodash_1.isNil(inputArg) || (lodash_1.isString(inputArg) && inputArg === "")) {
                continue;
            }
            return inputArg;
        }
        return null;
    }
    static getFunctionParamNames(fn) {
        return function_arguments_1.default(fn);
    }
    static bufferToString(buffer, encoding) {
        switch (encoding) {
            case "urlsafe":
                {
                    return safe_base64_1.encode(buffer);
                }
            default:
                {
                    return buffer.toString(encoding);
                }
        }
    }
    static stringToBuffer(theString, encoding) {
        switch (encoding) {
            case "urlsafe":
                {
                    return safe_base64_1.decode(theString);
                }
            default:
                {
                    return Buffer.from(theString, encoding);
                }
        }
    }
    static encrypt(text, password = APIConfig_1.APIConfig.ENCRYPTION_SECRET, encoding = 'base64') {
        password = lodash_1.padEnd(password, 32, "0");
        let iv = crypto_1.default.randomBytes(this._IV_LENGTH);
        let cipher = crypto_1.default.createCipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return APIUtils.bufferToString(iv, encoding) + ':' + APIUtils.bufferToString(encrypted, encoding);
    }
    static decrypt(text, password = APIConfig_1.APIConfig.ENCRYPTION_SECRET, encoding = 'base64') {
        let textParts = text.split(':');
        let iv = APIUtils.stringToBuffer(textParts.shift(), encoding);
        let encryptedText = APIUtils.stringToBuffer(textParts.join(':'), encoding);
        let decipher = crypto_1.default.createDecipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    static hashString(text, encoding = 'base64') {
        let shasum = crypto_1.default.createHash(this._HASH_ALG);
        shasum.update(text);
        return APIUtils.bufferToString(shasum.digest(), encoding);
    }
    static hashMD5(text, encoding = 'base64') {
        let md5 = crypto_1.default.createHash('md5');
        md5.update(text);
        return APIUtils.bufferToString(md5.digest(), encoding);
    }
    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    static createExpirationInSeconds(expirationInSeconds) {
        return Math.floor(Date.now() / 1000) + expirationInSeconds;
    }
}
exports.APIUtils = APIUtils;
APIUtils._IV_LENGTH = 16;
APIUtils._CRYPTO_ALG = 'aes-256-cbc';
APIUtils._HASH_ALG = 'sha256';
//# sourceMappingURL=APIUtils.js.map