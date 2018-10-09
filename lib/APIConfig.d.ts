export declare class APIConfig {
    static WEB_PORT: number;
    static API_URL_BASE: string;
    static LAZY_LOAD_APIS: boolean;
    static RUN_AS_SERVER: boolean;
    static DISPLAY_RAW_ERRORS: boolean;
    static LOG_400_ERRORS: boolean;
    static LOG_500_ERRORS: boolean;
    static OUTPUT_HAPI_RESULTS: boolean;
    static AWS_REGION: string;
    static ENCRYPTION_SECRET: string;
    static KV_STORAGE_SERVICE_PROVIDER: "MemoryKVService" | "DiskKVService" | "DynamoDBKVStorage";
    static DISK_KV_STORAGE_ROOT_PATH: string;
    static ENCRYPT_KV_DATA: boolean;
    static DYNAMO_KV_STORAGE_TABLE_NAME: string;
    static FILE_STORAGE_SERVICE_PROVIDER: "DiskFileService" | "S3FileService";
    static DISK_FILE_SERVICE_ROOT_PATH: string;
    static S3_FILE_SERVICE_ROOT_PATH: string;
}
