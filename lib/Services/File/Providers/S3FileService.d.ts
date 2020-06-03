/// <reference types="node" />
import { FileServiceProvider } from "../FileService";
export declare class S3FileService implements FileServiceProvider {
    private readonly _bucketName;
    private static _s3Client;
    static get s3Client(): any;
    constructor(bucketName?: string);
    writeFile(relativePath: string, contents: string | Buffer, encrypted?: boolean): Promise<void>;
    readFile(relativePath: string, returnAsBuffer?: boolean, encrypted?: boolean): Promise<string | Buffer>;
    pathExists(relativePath: string): Promise<boolean>;
    deleteFile(relativePath: string): Promise<void>;
    listDirectoriesInPath(relativePath: string): Promise<string[]>;
    listFilesInPath(relativePath: string): Promise<string[]>;
    copyFile(fromRelativePath: string, toRelativePath: string): Promise<void>;
}
