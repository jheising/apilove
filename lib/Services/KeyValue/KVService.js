"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIConfig_1 = require("../../APIConfig");
class KVService {
    static get instance() {
        if (!KVService._instance) {
            let kvProviderClass = require(`./${APIConfig_1.APIConfig.KV_STORAGE_SERVICE_PROVIDER}`)[APIConfig_1.APIConfig.KV_STORAGE_SERVICE_PROVIDER];
            KVService._instance = new kvProviderClass();
        }
        return KVService._instance;
    }
}
exports.KVService = KVService;
//# sourceMappingURL=KVService.js.map