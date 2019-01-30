"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const KVService_1 = require("../KVService");
const DiskFileService_1 = require("../../File/Providers/DiskFileService");
const APIConfig_1 = require("../../../APIConfig");
const APIUtils_1 = require("../../../APIUtils");
class DiskKVService extends KVService_1.KVServiceProvider {
    static get _fileService() {
        let service = DiskKVService._fileServiceInstance;
        if (lodash_1.isNil(service)) {
            service = new DiskFileService_1.DiskFileService(APIConfig_1.APIConfig.DISK_KV_STORAGE_ROOT_PATH);
            DiskKVService._fileServiceInstance = service;
        }
        return service;
    }
    setValue(namespace, key, value, expirationInSeconds) {
        let data = {
            value: value,
            expires: lodash_1.isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
        };
        return DiskKVService._fileService.writeFile(`${APIUtils_1.APIUtils.slugify(namespace)}/${APIUtils_1.APIUtils.slugify(key)}.json`, JSON.stringify(data));
    }
    hasValue(namespace, key) {
        return DiskKVService._fileService.pathExists(`${APIUtils_1.APIUtils.slugify(namespace)}/${APIUtils_1.APIUtils.slugify(key)}.json`);
    }
    _getValue(namespace, key) {
        return DiskKVService._fileService.readFile(`${APIUtils_1.APIUtils.slugify(namespace)}/${APIUtils_1.APIUtils.slugify(key)}.json`).then((fileContents) => {
            let data = JSON.parse(fileContents);
            return Promise.resolve(data);
        }).catch(() => {
            return;
        });
    }
    getValue(namespace, key) {
        return this._getValue(namespace, key).then((data) => {
            if (lodash_1.isNil(data)) {
                return Promise.resolve();
            }
            if (data.expires && data.expires <= Date.now()) {
                return this.deleteValue(namespace, key).then(() => Promise.resolve(data.value));
            }
            return Promise.resolve(data.value);
        });
    }
    deleteValue(namespace, key) {
        try {
            return DiskKVService._fileService.deleteFile(`${APIUtils_1.APIUtils.slugify(namespace)}/${APIUtils_1.APIUtils.slugify(key)}.json`);
        }
        // Ignore any errors
        catch (e) {
            return Promise.resolve();
        }
    }
    updateExpiration(namespace, key, expirationInSeconds) {
        return this._getValue(namespace, key).then((data) => {
            if (lodash_1.isNil(data)) {
                return Promise.resolve();
            }
            return this.setValue(namespace, key, data.value, expirationInSeconds);
        });
    }
}
exports.DiskKVService = DiskKVService;
//# sourceMappingURL=DiskKVService.js.map