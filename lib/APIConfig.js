"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const isLambda = require("is-lambda");
const Config_1 = require("./Services/Config");
class APIConfig {
}
// If running as a server, this is the port that will be used.
APIConfig.WEB_PORT = 3000;
// The root URL for this API, this must be changed when it gets pushed to your production API
APIConfig.API_URL_BASE = `http://localhost${APIConfig.WEB_PORT === 80 ? "" : `:${APIConfig.WEB_PORT}`}`;
// If set to true, APIs will only be loaded when they are accessed. This can cut down on memory used in a lambda function.
APIConfig.LAZY_LOAD_APIS = true;
// Used to force the API to run as a server, otherwise it will run as a lambda function when deployed serverlessly.
APIConfig.RUN_AS_SERVER = !isLambda;
// If set to true, raw error messages will be included in errors output from the API. This can be useful for debugging, but should usually be turned off in production.
APIConfig.DISPLAY_RAW_ERRORS = false;
// If set to true, this will log all 400 status errors to console.error.
APIConfig.LOG_400_ERRORS = false;
// If set to true, this will log all 500 status errors to console.error.
APIConfig.LOG_500_ERRORS = true;
// Slightly more developer (i.e. mostly human) friendly API results. See https://github.com/jheising/HAPI
APIConfig.OUTPUT_HAPI_RESULTS = true;
APIConfig.AWS_REGION = "us-east-1";
// TODO: CHANGE THIS!!
APIConfig.ENCRYPTION_SECRET = "E1E8A96B838495F8CD1310304361C741";
// This is the key-value storage service provider to use with your API (if you need it)
APIConfig.KV_STORAGE_SERVICE_PROVIDER = "DiskKVService";
// The storage path to be used when using the DiskKVService
APIConfig.DISK_KV_STORAGE_ROOT_PATH = "./data/kv";
// If set to true this will encrypt data stored in the Key-Value Service
APIConfig.ENCRYPT_KV_DATA = true;
// This is the file storage service provider to use with your API (if you need it)
APIConfig.FILE_STORAGE_SERVICE_PROVIDER = "DiskFileService";
APIConfig.DISK_FILE_SERVICE_ROOT_PATH = "./data";
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Number)
], APIConfig, "WEB_PORT", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "API_URL_BASE", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "LAZY_LOAD_APIS", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "RUN_AS_SERVER", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "DISPLAY_RAW_ERRORS", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "LOG_400_ERRORS", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "LOG_500_ERRORS", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "OUTPUT_HAPI_RESULTS", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "AWS_REGION", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "ENCRYPTION_SECRET", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "KV_STORAGE_SERVICE_PROVIDER", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "DISK_KV_STORAGE_ROOT_PATH", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", Boolean)
], APIConfig, "ENCRYPT_KV_DATA", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "DYNAMO_KV_STORAGE_TABLE_NAME", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "FILE_STORAGE_SERVICE_PROVIDER", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "DISK_FILE_SERVICE_ROOT_PATH", void 0);
__decorate([
    Config_1.EnvVarSync,
    __metadata("design:type", String)
], APIConfig, "S3_FILE_SERVICE_ROOT_PATH", void 0);
exports.APIConfig = APIConfig;
//# sourceMappingURL=APIConfig.js.map