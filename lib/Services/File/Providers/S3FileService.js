"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3FileService = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const APIConfig_1 = require("../../../APIConfig");
const lodash_1 = require("lodash");
class S3FileService {
    constructor(bucketName = APIConfig_1.APIConfig.S3_FILE_SERVICE_BUCKET_NAME) {
        this._bucketName = bucketName;
    }
    static get s3Client() {
        if (!S3FileService._s3Client) {
            S3FileService._s3Client = new aws_sdk_1.default.S3();
        }
        return S3FileService._s3Client;
    }
    writeFile(relativePath, contents, encrypted = false) {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath,
            Body: contents
        };
        if (encrypted) {
            params.ServerSideEncryption = "AES256";
        }
        return S3FileService.s3Client.putObject(params).promise();
    }
    readFile(relativePath, returnAsBuffer = false, encrypted = false) {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath
        };
        return S3FileService.s3Client.getObject(params).promise().then(data => {
            return returnAsBuffer ? data.Body : data.Body.toString("utf-8");
        });
    }
    pathExists(relativePath) {
        let params = {
            Bucket: this._bucketName,
            Prefix: relativePath,
            MaxKeys: 1
        };
        return S3FileService.s3Client.listObjectsV2(params).promise().then(data => {
            return data.KeyCount > 0;
        }).catch(error => {
            return false;
        });
    }
    deleteFile(relativePath) {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath
        };
        return S3FileService.s3Client.deleteObject(params).promise();
    }
    listDirectoriesInPath(relativePath) {
        // Append a / if there isn't one
        if (!(/\/$/.test(relativePath))) {
            relativePath += "/";
        }
        let params = {
            Bucket: this._bucketName,
            Delimiter: "/",
            Prefix: relativePath
        };
        return S3FileService.s3Client.listObjectsV2(params).promise().then(data => {
            let dirs = [];
            let commonPrefixes = lodash_1.get(data, "CommonPrefixes", []);
            for (let commonPrefix of commonPrefixes) {
                let dirName = commonPrefix.Prefix.replace(relativePath, "");
                if (/.+\/$/.test(dirName)) {
                    dirs.push(dirName.replace(/(.+)\/$/, "$1"));
                }
            }
            return dirs;
        });
    }
    listFilesInPath(relativePath) {
        return Promise.reject("Not implemented");
    }
    copyFile(fromRelativePath, toRelativePath) {
        let params = {
            Bucket: this._bucketName,
            CopySource: encodeURI(`${this._bucketName}/${fromRelativePath}`),
            Key: toRelativePath
        };
        return S3FileService.s3Client.copyObject(params).promise();
    }
}
exports.S3FileService = S3FileService;
//# sourceMappingURL=S3FileService.js.map