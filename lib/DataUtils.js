"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const APIConfig_1 = require("./APIConfig");
class DataUtils {
    static encrypt(text, password = APIConfig_1.APIConfig.ENCRYPTION_SECRET) {
        let iv = crypto.randomBytes(DataUtils._IV_LENGTH);
        let cipher = crypto.createCipheriv(DataUtils._CRYPTO_ALG, Buffer.from(password), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    static decrypt(text, password = APIConfig_1.APIConfig.ENCRYPTION_SECRET) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(DataUtils._CRYPTO_ALG, Buffer.from(password), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    static hashString(string) {
        let shasum = crypto.createHash(DataUtils._HASH_ALG);
        shasum.update(string);
        return shasum.digest('hex');
    }
    static hashMD5(string) {
        let md5 = crypto.createHash('md5');
        md5.update(string);
        return md5.digest('hex');
    }
}
DataUtils._IV_LENGTH = 16;
DataUtils._CRYPTO_ALG = 'aes-256-cbc';
DataUtils._HASH_ALG = 'sha256';
exports.DataUtils = DataUtils;
//# sourceMappingURL=DataUtils.js.map