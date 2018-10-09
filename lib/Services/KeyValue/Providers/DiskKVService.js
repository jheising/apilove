"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const KVService_1 = require("../KVService");
const DiskFileService_1 = require("../../File/Providers/DiskFileService");
const APIConfig_1 = require("../../../APIConfig");
const slugify_1 = require("slugify");
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
        return DiskKVService._fileService.writeFile(`${slugify_1.default(namespace)}/${slugify_1.default(key)}.json`, JSON.stringify(data));
    }
    hasValue(namespace, key) {
        return DiskKVService._fileService.fileExists(`${slugify_1.default(namespace)}/${slugify_1.default(key)}.json`);
    }
    _getValue(namespace, key) {
        return DiskKVService._fileService.readFile(`${slugify_1.default(namespace)}/${slugify_1.default(key)}.json`).then((fileContents) => {
            let data = JSON.parse(fileContents);
            return Promise.resolve(data);
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
        return DiskKVService._fileService.deleteFile(`${slugify_1.default(namespace)}/${slugify_1.default(key)}.json`);
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