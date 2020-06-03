import {FileServiceProvider} from "../FileService";
import path from "path";
import {APIConfig} from "../../../APIConfig";
import fs from "fs-extra";
import {each} from "async";
import util from "util";
import {APIError} from "../../../APIError";
import isString from "lodash/isString";
import {APIUtils} from "../../../APIUtils";

export class DiskFileService implements FileServiceProvider {
    private readonly _rootPath: string;

    constructor(rootPath: string = APIConfig.DISK_FILE_SERVICE_ROOT_PATH) {
        this._rootPath = path.resolve(process.cwd(), rootPath);
        fs.ensureDirSync(this._rootPath);
    }

    private _isInvalidFilePath(filePath: string): Promise<void> {
        let resolvedPath = path.normalize(filePath);

        // Don't allow any paths that are below our root
        let isInvalid = resolvedPath.indexOf(this._rootPath) !== 0;

        if (isInvalid) {
            return Promise.reject(new Error("invalid file path"));
        }

        return Promise.resolve();
    }

    writeFile(relativePath: string, contents: string | Buffer, encrypted:boolean = false): Promise<void> {

        if(encrypted)
        {
            throw new Error("Encryption not supported");
        }

        let filePath = path.join(this._rootPath, relativePath);

        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.outputFile)(filePath, contents));
    }

    readFile(relativePath: string, returnAsBuffer:boolean, encrypted:boolean = false): Promise<string | Buffer> {

        if(encrypted)
        {
            throw new Error("Encryption not supported");
        }

        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.readFile)(filePath))
            .then((fileContents) => returnAsBuffer ? fileContents : fileContents.toString())
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError.create404NotFoundError() : error));
    }

    pathExists(relativePath: string): Promise<boolean> {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath).then(() => util.promisify(fs.pathExists)(filePath));
    }

    deleteFile(relativePath: string): Promise<void> {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.unlink)(filePath))
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError.create404NotFoundError() : error));
    }

    listDirectoriesInPath(relativePath: string): Promise<string[]> {
        let directoryPath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(directoryPath).then(() => {

            return util.promisify(fs.readdir)(directoryPath)
                .then((items) => {
                    return new Promise<string[]>((resolve, reject) => {
                        let directories = [];

                        each(items, function (item, callback) {
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
                        return Promise.reject(APIError.create404NotFoundError());
                    }

                    return Promise.reject(error);
                });
        });
    }

    listFilesInPath(relativePath: string): Promise<string[]> {
        let directoryPath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(directoryPath).then(() => {

            return util.promisify(fs.readdir)(directoryPath)
                .then((items) => {
                    return new Promise<string[]>((resolve, reject) => {
                        let files = [];

                        each(items, function (item, callback) {
                            fs.stat(path.join(directoryPath, item), function (err, stats) {
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
                        return Promise.reject(APIError.create404NotFoundError());
                    }

                    return Promise.reject(error);
                });
        });
    }

    copyFile(fromRelativePath: string, toRelativePath: string): Promise<void> {

        let fromFilePath = path.join(this._rootPath, fromRelativePath);
        let toFilePath = path.join(this._rootPath, toRelativePath);

        return this._isInvalidFilePath(toFilePath)
            .then(() => util.promisify(fs.copy)(fromFilePath, toFilePath))
            .catch((error) => Promise.reject(error.code === "ENOENT" ? APIError.create404NotFoundError() : error));
    }
}