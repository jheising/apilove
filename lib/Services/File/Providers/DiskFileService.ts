import {FileServiceProvider} from "../FileService";
import * as path from "path";
import {APIConfig} from "../../../APIConfig";
import * as fs from "fs-extra";
import {each} from "async";
import * as util from "util";
import {APIError} from "../../../APIError";

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

    writeFile(relativePath: string, contents: string): Promise<void> {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.outputFile)(filePath, contents));
    }

    readFile(relativePath: string): Promise<string> {
        let filePath = path.join(this._rootPath, relativePath);
        return this._isInvalidFilePath(filePath)
            .then(() => util.promisify(fs.readFile)(filePath))
            .then((fileContents) => fileContents.toString())
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

    copyFile(fromRelativePath: string, toRelativePath: string): Promise<void> {
        return this._isInvalidFilePath(toRelativePath).then(() => {

            return util.promisify(fs.copy)(fromRelativePath, toRelativePath);

        });
    }
}