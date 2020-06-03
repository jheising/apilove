import {isBoolean, isNil, toString, castArray, toNumber, isString, padEnd} from "lodash";
import getArguments from "function-arguments";
import {APIConfig} from "./APIConfig";
import crypto from "crypto";
import slugify from "slugify";
import shortid from "shortid";
import {nanoid} from "nanoid";
import {encode, decode} from "safe-base64";
import isBuffer from "lodash/isBuffer";

slugify.extend({"/": ":"});

export type APIUtilsEncoding = BufferEncoding | "urlsafe";

export class APIUtils {

    static getRawTypeName(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    static generateShortID() {
        return shortid.generate();
    }

    static generateLongID(length?: number) {
        return nanoid(length);
    }

    static slugify(text: string) {
        return slugify(text);
    }

    static convertToType(value: any, convertToType: string): any {

        if (isNil(convertToType)) {
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
                } catch (e) {
                }
            }

            return undefined;
        }

        switch (convertToType) {
            case "String": {
                convertedValue = toString(value);
                break;
            }
            case "Boolean": {
                convertedValue = APIUtils.toBoolean(value);
                break;
            }
            case "Number": {
                convertedValue = toNumber(value);
                break;
            }
            case "Array": {
                convertedValue = castArray(value);
                break;
            }
            case "Object": {
                try {
                    convertedValue = JSON.parse(value);
                } catch (e) {
                    convertedValue = value;
                }
            }
        }

        return convertedValue;
    }

    static toBoolean(input: any) {
        if (isBoolean(input)) {
            return input;
        }

        return (/(1|true|yes)/i).test(input);
    }

    static coalesce(...inputArgs: any[]) {

        for (let inputArg of inputArgs) {

            // Consider an empty string as a null value
            if (isNil(inputArg) || (isString(inputArg) && inputArg === "")) {
                continue;
            }

            return inputArg;
        }

        return null;
    }

    static getFunctionParamNames(fn: Function): string[] {
        return getArguments(fn);
    }

    private static _IV_LENGTH = 16;
    private static _CRYPTO_ALG = 'aes-256-cbc';
    private static _HASH_ALG = 'sha256';

    static bufferToString(buffer: Buffer, encoding: APIUtilsEncoding): string {
        switch (encoding) {
            case "urlsafe": {
                return encode(buffer);
            }
            default: {
                return buffer.toString(encoding);
            }
        }
    }

    static stringToBuffer(theString: string, encoding: APIUtilsEncoding): Buffer {
        switch (encoding) {
            case "urlsafe": {
                return decode(theString);
            }
            default: {
                return Buffer.from(theString, encoding);
            }
        }
    }

    static encrypt(content: string | Buffer, password: string = APIConfig.ENCRYPTION_SECRET, encoding: APIUtilsEncoding = 'base64') {
        password = padEnd(password, 32, "0");

        let iv = crypto.randomBytes(this._IV_LENGTH);
        let cipher = crypto.createCipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let encrypted = cipher.update(content);

        const separator = encoding === "urlsafe" ? "%3A" : ":";

        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return APIUtils.bufferToString(iv, encoding) + separator + APIUtils.bufferToString(encrypted, encoding);
    }

    static decrypt(content: string | Buffer, password: string = APIConfig.ENCRYPTION_SECRET, encoding: APIUtilsEncoding = 'base64') {

        const separator = encoding === "urlsafe" ? "%3A" : ":";

        if(isBuffer(content))
        {
            content = (content as Buffer).toString("utf8");
        }

        let textParts = (content as string).split(separator);
        let iv = APIUtils.stringToBuffer(textParts.shift(), encoding);
        let encryptedText = APIUtils.stringToBuffer(textParts.join(separator), encoding);
        let decipher = crypto.createDecipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    static hashString(text: string, encoding: APIUtilsEncoding = 'base64') {
        let shasum = crypto.createHash(this._HASH_ALG);
        shasum.update(text);
        return APIUtils.bufferToString(shasum.digest(), encoding);
    }

    static hashMD5(text: string, encoding: APIUtilsEncoding = 'base64') {
        let md5 = crypto.createHash('md5');
        md5.update(text);
        return APIUtils.bufferToString(md5.digest(), encoding);
    }

    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    static createExpirationInSeconds(expirationInSeconds: number): number {
        return Math.floor(Date.now() / 1000) + expirationInSeconds;
    }
}