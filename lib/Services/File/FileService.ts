import {APIConfig} from "../../APIConfig";

export abstract class FileServiceProvider {
    abstract writeFile(relativePath: string, contents: string):Promise<void>;
    abstract readFile(relativePath: string):Promise<string>;
    abstract listDirectoriesInPath(relativePath: string):Promise<string[]>;
    abstract fileExists(relativePath: string):Promise<boolean>;
    abstract deleteFile(relativePath: string):Promise<void>;
}

export class FileService {

    private static _providerInstance: FileServiceProvider;
    private static get _provider(): FileServiceProvider {
        if (!FileService._providerInstance) {
            let providerClass = require(`./Providers/${APIConfig.FILE_STORAGE_SERVICE_PROVIDER}`)[APIConfig.FILE_STORAGE_SERVICE_PROVIDER];
            FileService._providerInstance = new providerClass();
        }

        return FileService._providerInstance;
    }

    static writeFile(relativePath: string, contents: string):Promise<void> {
        return FileService._provider.writeFile(relativePath, contents);
    }

    static readFile(relativePath: string):Promise<string> {
        return FileService._provider.readFile(relativePath);
    }

    static listDirectoriesInPath(relativePath: string):Promise<string[]> {
        return FileService._provider.listDirectoriesInPath(relativePath);
    }

    static fileExists(relativePath: string):Promise<boolean> {
        return FileService._provider.fileExists(relativePath);
    }

    static deleteFile(relativePath: string):Promise<void>
    {
        return FileService._provider.deleteFile(relativePath);
    }
}