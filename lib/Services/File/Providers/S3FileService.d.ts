import { FileServiceProvider } from "../FileService";
export declare class S3FileService implements FileServiceProvider {
    private readonly _bucketName;
    private static _s3Client;
    static readonly s3Client: any;
    constructor(bucketName?: string);
    writeFile(relativePath: string, contents: string): Promise<void>;
    readFile(relativePath: string): Promise<string>;
    pathExists(relativePath: string): Promise<boolean>;
    deleteFile(relativePath: string): Promise<void>;
    listDirectoriesInPath(relativePath: string): Promise<string[]>;
}
