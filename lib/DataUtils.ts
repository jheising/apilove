import * as crypto from "crypto";
import {APIConfig} from "./APIConfig";

export class DataUtils {

    private static _IV_LENGTH = 16;
    private static _CRYPTO_ALG = 'aes-256-cbc';
    private static _HASH_ALG = 'sha256';

    static encrypt(text: string, password:string = APIConfig.ENCRYPTION_SECRET) {
        let iv = crypto.randomBytes(DataUtils._IV_LENGTH);
        let cipher = crypto.createCipheriv(DataUtils._CRYPTO_ALG, Buffer.from(password), iv);
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt(text: string, password:string = APIConfig.ENCRYPTION_SECRET) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(DataUtils._CRYPTO_ALG, Buffer.from(password), iv);
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    static hashString(string:string)
    {
        let shasum = crypto.createHash(DataUtils._HASH_ALG);
        shasum.update(string);
        return shasum.digest('hex');
    }

    static hashMD5(string:string)
    {
        let md5 = crypto.createHash('md5');
        md5.update(string);
        return md5.digest('hex');
    }
}