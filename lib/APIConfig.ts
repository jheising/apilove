import * as isLambda from "is-lambda";
import {get} from "lodash";
import {EnvVarSync} from "./Services/Config";

export class APIConfig {
    // If running as a server, this is the port that will be used.
    @EnvVarSync
    static WEB_PORT: number = 3000;

    // The root URL for this API, this must be changed when it gets pushed to your production API
    @EnvVarSync
    static API_URL_BASE: string = `http://localhost${APIConfig.WEB_PORT === 80 ? "" : `:${APIConfig.WEB_PORT}`}`;

    // If set to true, APIs will only be loaded when they are accessed. This can cut down on memory used in a lambda function.
    @EnvVarSync
    static LAZY_LOAD_APIS: boolean = true;

    // Used to force the API to run as a server, otherwise it will run as a lambda function when deployed serverlessly.
    @EnvVarSync
    static RUN_AS_SERVER: boolean = !isLambda;

    // If set to true, raw error messages will be included in errors output from the API. This can be useful for debugging, but should usually be turned off in production.
    @EnvVarSync
    static DISPLAY_RAW_ERRORS: boolean = false;

    // If set to true, this will log all 400 status errors to console.error.
    @EnvVarSync
    static LOG_400_ERRORS: boolean = false;

    // If set to true, this will log all 500 status errors to console.error.
    @EnvVarSync
    static LOG_500_ERRORS: boolean = true;

    // Slightly more developer (i.e. mostly human) friendly API results. See https://github.com/jheising/HAPI
    @EnvVarSync
    static OUTPUT_HAPI_RESULTS: boolean = true;

    @EnvVarSync
    static AWS_REGION: string = "us-east-1";

    // TODO: CHANGE THIS!!
    @EnvVarSync
    static ENCRYPTION_SECRET:string = "E1E8A96B838495F8CD1310304361C741";

    // This is the key-value storage service provider to use with your API (if you need it)
    @EnvVarSync
    static KV_STORAGE_SERVICE_PROVIDER: "MemoryKVService" | "DiskKVService" | "DynamoDBKVService" = "DiskKVService";

    // The storage path to be used when using the DiskKVService
    @EnvVarSync
    static DISK_KV_STORAGE_ROOT_PATH: string = "./data/kv";

    // If set to true this will encrypt data stored in the Key-Value Service
    @EnvVarSync
    static ENCRYPT_KV_DATA:boolean = true;

    // The table name to use when storing key-value data in DynamoDB
    @EnvVarSync
    static DYNAMO_KV_STORAGE_TABLE_NAME: string;

    // This is the file storage service provider to use with your API (if you need it)
    @EnvVarSync
    static FILE_STORAGE_SERVICE_PROVIDER: "DiskFileService" | "S3FileService" = "DiskFileService";

    @EnvVarSync
    static DISK_FILE_SERVICE_ROOT_PATH: string = "./data";

    @EnvVarSync
    static S3_FILE_SERVICE_BUCKET_NAME: string;
}