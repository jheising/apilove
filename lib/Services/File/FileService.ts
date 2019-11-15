import {APIConfig} from "../../APIConfig";

export abstract class FileServiceProvider {
    abstract copyFile(fromRelativePath: string, toRelativePath: string):Promise<void>;
    abstract writeFile(relativePath: string, contents: string | Buffer):Promise<void>;
    abstract readFile(relativePath: string, returnAsBuffer:boolean):Promise<string | Buffer>;
    abstract listDirectoriesInPath(relativePath: string):Promise<string[]>;
    abstract listFilesInPath(relativePath: string):Promise<string[]>;
    abstract pathExists(relativePath: string):Promise<boolean>;
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

    static copyFile(fromRelativePath: string, toRelativePath: string):Promise<void> {
        return FileService._provider.copyFile(fromRelativePath, toRelativePath);
    }

    static writeFile(relativePath: string, contents: string | Buffer):Promise<void> {
        return FileService._provider.writeFile(relativePath, contents);
    }

    static readFile(relativePath: string, returnAsBuffer:boolean = false):Promise<string | Buffer> {
        return FileService._provider.readFile(relativePath, returnAsBuffer);
    }

    static listDirectoriesInPath(relativePath: string):Promise<string[]> {
        return FileService._provider.listDirectoriesInPath(relativePath);
    }

    static listFilesInPath(relativePath: string):Promise<string[]> {
        return FileService._provider.listFilesInPath(relativePath);
    }

    static pathExists(relativePath: string):Promise<boolean> {
        return FileService._provider.pathExists(relativePath);
    }

    static deleteFile(relativePath: string):Promise<void>
    {
        return FileService._provider.deleteFile(relativePath);
    }
}