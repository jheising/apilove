import {isBoolean, isNil, toString, castArray, toNumber, isString} from "lodash";
import * as getArguments from "function-arguments";
import {APIConfig} from "./APIConfig";
import * as crypto from "crypto";
import slugify from "slugify";

slugify.extend({"/": ":"});

export class APIUtils {

    static getRawTypeName(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
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
                }
                catch (e) {
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
                }
                catch (e) {
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

    static encrypt(text: string, password:string = APIConfig.ENCRYPTION_SECRET) {
        let iv = crypto.randomBytes(this._IV_LENGTH);
        let cipher = crypto.createCipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('base64') + ':' + encrypted.toString('base64');
    }

    static decrypt(text: string, password:string = APIConfig.ENCRYPTION_SECRET) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'base64');
        let encryptedText = Buffer.from(textParts.join(':'), 'base64');
        let decipher = crypto.createDecipheriv(this._CRYPTO_ALG, Buffer.from(password), iv);
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    static slugify(text:string)
    {
        return slugify(text);
    }

    static hashString(text:string, encoding:string = 'base64')
    {
        let shasum = crypto.createHash(this._HASH_ALG);
        shasum.update(text);
        return shasum.digest(encoding as any);
    }

    static hashMD5(text:string, encoding:string = 'base64')
    {
        let md5 = crypto.createHash('md5');
        md5.update(text);
        return md5.digest(encoding as any);
    }

    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    static createExpirationInSeconds(expirationInSeconds:number):number
    {
        return Math.floor(Date.now() / 1000) + expirationInSeconds;
    }
}