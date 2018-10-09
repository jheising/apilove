"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*export class S3FileService implements FileService {

    private static _s3Client;
    static get s3Client() {
        if (!S3FileService._s3Client) {
            S3FileService._s3Client = new aws.S3();
        }

        return S3FileService._s3Client;
    }

    writeFile(relativePath: string, contents: string, callback: (error?: Error) => void) {
        S3FileService.s3Client.putObject({
            Bucket: APIConfig.S3_FILE_SERVICE_ROOT_PATH,
            Key: relativePath,
            Body: contents
        }, function (err, data) {
            MaskedError.processCallback(err, callback);
        });
    }

    readFile(relativePath: string, callback: (error: Error, contents: string) => void) {
        S3FileService.s3Client.getObject({
            Bucket: this._bucketName,
            Key: relativePath
        }, function (err, data) {
            if (MaskedError.shouldCallbackWithError(err, callback)) return;
            if (callback) callback(null, data.Body.toString());
        });
    }

    fileExists(relativePath: string, callback: (error: Error, exists: boolean) => void)
    {
        S3FileService.s3Client.headObject({
            Bucket: this._bucketName,
            Key: relativePath
        }, function (err, data) {
            callback(null, !(err || _.isNil(data)));
        });
    }

    listDirectoriesInPath(relativePath: string, callback: (error: Error, directories: string[]) => void) {
        relativePath = path.join(relativePath, "/");

        S3FileService.s3Client.listObjectsV2({
            Bucket: this._bucketName,
            Delimiter: '/',
            Prefix: relativePath
        }, function (err, data) {

            if (MaskedError.shouldCallbackWithError(err, callback)) return;

            let directories = [];

            for (let key of data.CommonPrefixes) {
                let pathElements = path.relative(relativePath, key.Prefix).split("/");
                directories.push(pathElements[0]);
            }

            if(callback) callback(null, directories);
        });
    }
}*/ 
//# sourceMappingURL=S3FileService.js.map