"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const KVService_1 = require("../KVService");
class MemoryKVService extends KVService_1.KVServiceProvider {
    constructor() {
        super(...arguments);
        this._data = {};
    }
    setValue(namespace, key, value, expirationInSeconds) {
        this._data[namespace + key] = {
            expires: lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        };
        return Promise.resolve();
    }
    hasValue(namespace, key) {
        return Promise.resolve((namespace + key) in this._data);
    }
    getValue(namespace, key) {
        let data = this._data[namespace + key];
        if (lodash_1.isNil(data) || (data.expires && data.expires <= Date.now())) {
            return Promise.resolve();
        }
        return Promise.resolve(data.value);
    }
    deleteValue(namespace, key) {
        delete this._data[namespace + key];
        return Promise.resolve();
    }
    updateExpiration(namespace, key, expirationInSeconds) {
        let data = this._data[namespace + key];
        if (!lodash_1.isNil(data)) {
            data.expiration = lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }
        return Promise.resolve();
    }
}
exports.MemoryKVService = MemoryKVService;
//# sourceMappingURL=MemoryKVService.js.map