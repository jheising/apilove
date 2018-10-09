"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIConfig_1 = require("../../APIConfig");
class FileServiceProvider {
}
exports.FileServiceProvider = FileServiceProvider;
class FileService {
    static get _provider() {
        if (!FileService._providerInstance) {
            let providerClass = require(`./Providers/${APIConfig_1.APIConfig.FILE_STORAGE_SERVICE_PROVIDER}`)[APIConfig_1.APIConfig.FILE_STORAGE_SERVICE_PROVIDER];
            FileService._providerInstance = new providerClass();
        }
        return FileService._providerInstance;
    }
    static writeFile(relativePath, contents) {
        return FileService._provider.writeFile(relativePath, contents);
    }
    static readFile(relativePath) {
        return FileService._provider.readFile(relativePath);
    }
    static listDirectoriesInPath(relativePath) {
        return FileService._provider.listDirectoriesInPath(relativePath);
    }
    static fileExists(relativePath) {
        return FileService._provider.fileExists(relativePath);
    }
    static deleteFile(relativePath) {
        return FileService._provider.deleteFile(relativePath);
    }
}
exports.FileService = FileService;
//# sourceMappingURL=FileService.js.map