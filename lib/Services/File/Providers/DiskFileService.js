"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const APIConfig_1 = require("../../../APIConfig");
const fs_extra_1 = __importDefault(require("fs-extra"));
const async_1 = require("async");
const util_1 = __importDefault(require("util"));
const APIError_1 = require("../../../APIError");
class DiskFileService {
    constructor(rootPath = APIConfig_1.APIConfig.DISK_FILE_SERVICE_ROOT_PATH) {
        this._rootPath = path_1.default.resolve(process.cwd(), rootPath);
        fs_extra_1.default.ensureDirSync(this._rootPath);
    }
    _isInvalidFilePath(filePath) {
        let resolvedPath = path_1.default.normalize(filePath);
        // Don't allow any paths that are below our root
        let isInvalid = resolvedPath.indexOf(this._rootPath) !== 0;
        if (isInvalid) {
            return Promise.reject(new Error("invalid file path"));
        }
        return Promise.resolve();
    }
    writeFile(relativePath, contents) {
        let filePath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util_1.default.promisify(fs_extra_1.default.outputFile)(filePath, contents));
    }
    readFile(relativePath, returnAsBuffer) {
        let filePath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util_1.default.promisify(fs_extra_1.default.readFile)(filePath))
            .then((fileContents) => returnAsBuffer ? fileContents : fileContents.toString())
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError_1.APIError.create404NotFoundError() : error));
    }
    pathExists(relativePath) {
        let filePath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath).then(() => util_1.default.promisify(fs_extra_1.default.pathExists)(filePath));
    }
    deleteFile(relativePath) {
        let filePath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util_1.default.promisify(fs_extra_1.default.unlink)(filePath))
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError_1.APIError.create404NotFoundError() : error));
    }
    listDirectoriesInPath(relativePath) {
        let directoryPath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(directoryPath).then(() => {
            return util_1.default.promisify(fs_extra_1.default.readdir)(directoryPath)
                .then((items) => {
                return new Promise((resolve, reject) => {
                    let directories = [];
                    async_1.each(items, function (item, callback) {
                        fs_extra_1.default.stat(path_1.default.join(directoryPath, item), function (err, stats) {
                            if (!err && stats.isDirectory()) {
                                directories.push(item);
                            }
                            callback();
                        });
                    }, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(directories);
                    });
                });
            })
                .catch((error) => {
                if (error.code === "ENOENT") {
                    return Promise.reject(APIError_1.APIError.create404NotFoundError());
                }
                return Promise.reject(error);
            });
        });
    }
    listFilesInPath(relativePath) {
        let directoryPath = path_1.default.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(directoryPath).then(() => {
            return util_1.default.promisify(fs_extra_1.default.readdir)(directoryPath)
                .then((items) => {
                return new Promise((resolve, reject) => {
                    let files = [];
                    async_1.each(items, function (item, callback) {
                        fs_extra_1.default.stat(path_1.default.join(directoryPath, item), function (err, stats) {
                            if (!err && stats.isFile()) {
                                files.push(item);
                            }
                            callback();
                        });
                    }, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(files.sort());
                    });
                });
            })
                .catch((error) => {
                if (error.code === "ENOENT") {
                    return Promise.reject(APIError_1.APIError.create404NotFoundError());
                }
                return Promise.reject(error);
            });
        });
    }
    copyFile(fromRelativePath, toRelativePath) {
        let fromFilePath = path_1.default.join(this._rootPath, fromRelativePath);
        let toFilePath = path_1.default.join(this._rootPath, toRelativePath);
        return this._isInvalidFilePath(toFilePath)
            .then(() => util_1.default.promisify(fs_extra_1.default.copy)(fromFilePath, toFilePath))
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError_1.APIError.create404NotFoundError() : error));
    }
}
exports.DiskFileService = DiskFileService;
//# sourceMappingURL=DiskFileService.js.map