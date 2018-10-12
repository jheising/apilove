"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIConfig_1 = require("../../APIConfig");
const lodash_1 = require("lodash");
const APIUtils_1 = require("../../APIUtils");
class KVServiceProvider {
}
exports.KVServiceProvider = KVServiceProvider;
class KVService {
    static get _provider() {
        if (!KVService._providerInstance) {
            let providerClass = require(`./Providers/${APIConfig_1.APIConfig.KV_STORAGE_SERVICE_PROVIDER}`)[APIConfig_1.APIConfig.KV_STORAGE_SERVICE_PROVIDER];
            KVService._providerInstance = new providerClass();
        }
        return KVService._providerInstance;
    }
    static setValue(namespace, key, value, expirationInSeconds, encrypted = APIConfig_1.APIConfig.ENCRYPT_KV_DATA) {
        if (encrypted) {
            value = APIUtils_1.APIUtils.encrypt(JSON.stringify(value));
        }
        return KVService._provider.setValue(namespace, key, value, expirationInSeconds);
    }
    static getValue(namespace, key, defaultValue, encrypted = APIConfig_1.APIConfig.ENCRYPT_KV_DATA) {
        return KVService._provider.getValue(namespace, key).then((value) => {
            if (lodash_1.isNil(value)) {
                return defaultValue;
            }
            if (encrypted) {
                value = JSON.parse(APIUtils_1.APIUtils.decrypt(value));
            }
            return value;
        });
    }
    static deleteValue(namespace, key) {
        return KVService._provider.deleteValue(namespace, key);
    }
    static hasValue(namespace, key) {
        return KVService._provider.hasValue(namespace, key);
    }
    static updateExpiration(namespace, key, expirationInSeconds) {
        return KVService._provider.updateExpiration(namespace, key, expirationInSeconds);
    }
}
exports.KVService = KVService;
//# sourceMappingURL=KVService.js.map