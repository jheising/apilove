"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryKVService = void 0;
const lodash_1 = require("lodash");
const KVService_1 = require("../KVService");
class MemoryKVService extends KVService_1.KVServiceProvider {
    constructor() {
        super(...arguments);
        this._data = {};
    }
    _isExpired(value) {
        return (value.expires > 0 && value.expires <= Date.now());
    }
    setValue(namespace, key, value, expirationInSeconds) {
        lodash_1.set(this._data, [namespace, key], {
            expires: lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        });
        return Promise.resolve();
    }
    hasValue(namespace, key) {
        return Promise.resolve(lodash_1.has(this._data, [namespace, key]));
    }
    getValue(namespace, key) {
        let data = lodash_1.get(this._data, [namespace, key]);
        if (this._isExpired(data)) {
            lodash_1.unset(this._data, [namespace, key]);
            return Promise.resolve();
        }
        return Promise.resolve(data.value);
    }
    deleteValue(namespace, key) {
        lodash_1.unset(this._data, [namespace, key]);
        return Promise.resolve();
    }
    updateExpiration(namespace, key, expirationInSeconds) {
        let data = lodash_1.get(this._data, [namespace, key]);
        if (!lodash_1.isNil(data)) {
            data.expiration = lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }
        return Promise.resolve();
    }
    getValues(namespace, page, pageSize) {
        return Promise.reject("Not implemented");
    }
}
exports.MemoryKVService = MemoryKVService;
//# sourceMappingURL=MemoryKVService.js.map