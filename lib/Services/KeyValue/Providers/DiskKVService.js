"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskKVService = void 0;
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
            key: key,
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
            // Ignore errors
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
        return DiskKVService._fileService.deleteFile(`${APIUtils_1.APIUtils.slugify(namespace)}/${APIUtils_1.APIUtils.slugify(key)}.json`).catch((e) => {
            // Ignore errors
            return;
        });
    }
    updateExpiration(namespace, key, expirationInSeconds) {
        return this._getValue(namespace, key).then((data) => {
            if (lodash_1.isNil(data)) {
                return Promise.resolve();
            }
            return this.setValue(namespace, key, data.value, expirationInSeconds);
        });
    }
    getValues(namespace, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let files = yield DiskKVService._fileService.listFilesInPath(`${APIUtils_1.APIUtils.slugify(namespace)}`);
            let values = [];
            let totalCount = files.length;
            let totalPages = Math.ceil(totalCount / pageSize);
            if (page > 0 && page <= totalPages) {
                let actions = [];
                let startIndex = pageSize * (page - 1);
                let endIndex = Math.min(startIndex + pageSize - 1, files.length - 1);
                for (let index = startIndex; index <= endIndex; index++) {
                    let filename = files[index];
                    actions.push(DiskKVService._fileService.readFile(`${APIUtils_1.APIUtils.slugify(namespace)}/${filename}`));
                }
                let results = yield Promise.all(actions);
                for (let result of results) {
                    let parsedResult = JSON.parse(result);
                    if (parsedResult.expires && parsedResult.expires <= Date.now()) {
                        continue;
                    }
                    values.push({
                        key: parsedResult.key,
                        value: parsedResult.value
                    });
                }
            }
            return {
                totalCount: totalCount,
                totalPages: totalPages,
                page: page,
                values: values
            };
        });
    }
}
exports.DiskKVService = DiskKVService;
//# sourceMappingURL=DiskKVService.js.map