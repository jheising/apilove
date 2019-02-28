export declare abstract class FileServiceProvider {
    abstract copyFile(fromRelativePath: string, toRelativePath: string): Promise<void>;
    abstract writeFile(relativePath: string, contents: string): Promise<void>;
    abstract readFile(relativePath: string): Promise<string>;
    abstract listDirectoriesInPath(relativePath: string): Promise<string[]>;
    abstract pathExists(relativePath: string): Promise<boolean>;
    abstract deleteFile(relativePath: string): Promise<void>;
}
export declare class FileService {
    private static _providerInstance;
    private static readonly _provider;
    static copyFile(fromRelativePath: string, toRelativePath: string): Promise<void>;
    static writeFile(relativePath: string, contents: string): Promise<void>;
    static readFile(relativePath: string): Promise<string>;
    static listDirectoriesInPath(relativePath: string): Promise<string[]>;
    static pathExists(relativePath: string): Promise<boolean>;
    static deleteFile(relativePath: string): Promise<void>;
}
