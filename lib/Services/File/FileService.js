"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = exports.FileServiceProvider = void 0;
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
    static copyFile(fromRelativePath, toRelativePath) {
        return FileService._provider.copyFile(fromRelativePath, toRelativePath);
    }
    static writeFile(relativePath, contents, encrypted = false) {
        return FileService._provider.writeFile(relativePath, contents, encrypted);
    }
    static readFile(relativePath, returnAsBuffer = false, encrypted = false) {
        return FileService._provider.readFile(relativePath, returnAsBuffer, encrypted);
    }
    static listDirectoriesInPath(relativePath) {
        return FileService._provider.listDirectoriesInPath(relativePath);
    }
    static listFilesInPath(relativePath) {
        return FileService._provider.listFilesInPath(relativePath);
    }
    static pathExists(relativePath) {
        return FileService._provider.pathExists(relativePath);
    }
    static deleteFile(relativePath) {
        return FileService._provider.deleteFile(relativePath);
    }
}
exports.FileService = FileService;
//# sourceMappingURL=FileService.js.map