export declare class APIConfig {
    static WEB_PORT: number;
    static LAZY_LOAD_APIS: boolean;
    static RUN_AS_SERVER: boolean;
    static DISPLAY_RAW_ERRORS: boolean;
    static LOG_400_ERRORS: boolean;
    static LOG_500_ERRORS: boolean;
    static OUTPUT_HAPI_RESULTS: boolean;
    static AWS_REGION: string;
    static KV_STORAGE_SERVICE_PROVIDER: "MemoryKVService" | "DynamoDBKVStorage";
    static DYNAMO_KV_STORAGE_TABLE_NAME: string;
}
