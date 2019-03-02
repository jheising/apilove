import * as aws from "aws-sdk";
import {FileServiceProvider} from "../FileService";
import {APIConfig} from "../../../APIConfig";
import {each} from "async";
import {get} from "lodash";

export class S3FileService implements FileServiceProvider {
    private readonly _bucketName: string;

    private static _s3Client;
    static get s3Client() {
        if (!S3FileService._s3Client) {
            S3FileService._s3Client = new aws.S3();
        }

        return S3FileService._s3Client;
    }

    constructor(bucketName: string = APIConfig.S3_FILE_SERVICE_BUCKET_NAME) {
        this._bucketName = bucketName;
    }

    writeFile(relativePath: string, contents: string): Promise<void> {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath,
            Body: contents
        };
        return S3FileService.s3Client.putObject(params).promise();
    }

    readFile(relativePath: string): Promise<string> {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath
        };

        return S3FileService.s3Client.getObject(params).promise().then(data => {
            return data.Body.toString("utf-8");
        });
    }

    pathExists(relativePath: string): Promise<boolean> {
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

    deleteFile(relativePath: string): Promise<void> {
        let params = {
            Bucket: this._bucketName,
            Key: relativePath
        };
        return S3FileService.s3Client.deleteObject(params).promise();
    }

    listDirectoriesInPath(relativePath: string): Promise<string[]> {

        // Append a / if there isn't one
        if(!(/\/$/.test(relativePath)))
        {
            relativePath += "/";
        }

        let params = {
            Bucket: this._bucketName,
            Delimiter: "/",
            Prefix: relativePath
        };
        return S3FileService.s3Client.listObjectsV2(params).promise().then(data => {
            let dirs:string[] = [];

            let commonPrefixes = get(data, "CommonPrefixes", []);

            for(let commonPrefix of commonPrefixes)
            {
                let dirName:string = commonPrefix.Prefix.replace(relativePath, "");

                if(/.+\/$/.test(dirName))
                {
                    dirs.push(dirName.replace(/(.+)\/$/, "$1"));
                }
            }

            return dirs;
        });
    }

    copyFile(fromRelativePath: string, toRelativePath: string): Promise<void> {
        let params = {
            Bucket: this._bucketName,
            CopySource: encodeURI(`${this._bucketName}/${fromRelativePath}`),
            Key: toRelativePath
        };
        return S3FileService.s3Client.copyObject(params).promise();
    }
}