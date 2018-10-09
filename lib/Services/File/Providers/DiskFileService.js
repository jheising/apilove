"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const APIConfig_1 = require("../../../APIConfig");
const fs = require("fs-extra");
const async_1 = require("async");
const APIBase_1 = require("../../../APIBase");
const util = require("util");
class DiskFileService {
    constructor(rootPath = APIConfig_1.APIConfig.DISK_FILE_SERVICE_ROOT_PATH) {
        this._rootPath = path.resolve(process.cwd(), rootPath);
        fs.ensureDirSync(this._rootPath);
    }
    _isInvalidFilePath(filePath) {
        let resolvedPath = path.normalize(filePath);
        // Don't allow any paths that are below our root
        let isInvalid = resolvedPath.indexOf(this._rootPath) !== 0;
        if (isInvalid) {
            return Promise.reject(new Error("invalid file path"));
        }
        return Promise.resolve();
    }
    writeFile(relativePath, contents) {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.outputFile)(filePath, contents));
    }
    readFile(relativePath) {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.readFile)(filePath))
            .then((fileContents) => fileContents.toString())
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIBase_1.APIError.create404NotFoundError() : error));
        ;
    }
    fileExists(relativePath) {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath).then(() => util.promisify(fs.pathExists)(filePath));
    }
    deleteFile(relativePath) {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath).then(() => util.promisify(fs.unlink)(filePath));
    }
    listDirectoriesInPath(relativePath) {
        let directoryPath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(directoryPath).then(() => {
            return util.promisify(fs.readdir)(directoryPath)
                .then((items) => {
                return new Promise((resolve, reject) => {
                    let directories = [];
                    async_1.each(items, function (item, callback) {
                        fs.stat(path.join(directoryPath, item), function (err, stats) {
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
                    return Promise.reject(APIBase_1.APIError.create404NotFoundError());
                }
                return Promise.reject(error);
            });
        });
    }
}
exports.DiskFileService = DiskFileService;
//# sourceMappingURL=DiskFileService.js.map