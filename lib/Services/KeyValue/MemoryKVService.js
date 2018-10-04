"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const KVService_1 = require("./KVService");
class MemoryKVService extends KVService_1.KVService {
    constructor() {
        super(...arguments);
        this._data = {};
    }
    setValue(namespace, key, value, expirationInSeconds, done) {
        this._data[namespace + key] = {
            expires: lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        };
        if (done)
            done(null);
    }
    hasValue(namespace, key, done) {
        if (done) {
            done(null, (namespace + key) in this._data);
        }
    }
    getValue(namespace, key, done) {
        let data = this._data[namespace + key];
        if (lodash_1.isNil(data) || (data.expires && data.expires <= Date.now())) {
            if (done)
                done();
            return;
        }
        if (done)
            done(null, data.value);
    }
    deleteValue(namespace, key, done) {
        delete this._data[namespace + key];
        if (done)
            done();
    }
    updateExpiration(namespace, key, expirationInSeconds, done) {
        let data = this._data[namespace + key];
        if (!lodash_1.isNil(data)) {
            data.expiration = lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }
        if (done)
            done();
    }
}
exports.MemoryKVService = MemoryKVService;
//# sourceMappingURL=MemoryKVService.js.map