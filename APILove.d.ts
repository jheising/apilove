import { APIConfig } from "./lib/APIConfig";
import { APIUtils } from "./lib/APIUtils";
import "reflect-metadata";
import { APIResponse } from "./lib/APIResponse";
import { APIError } from "./lib/APIError";
import { KVService } from "./lib/Services/KeyValue/KVService";
import { FileService } from "./lib/Services/File/FileService";
import { EnvVarSync } from "./lib/Services/Config";
export interface APILoaderDefinition {
    apiPath?: string;
    require: string;
    moduleName?: string;
}
export interface APILoveDocsOptions {
    title?: string;
    intro?: string;
}
export interface APILoveOptions {
    apis?: APILoaderDefinition[];
    loadStandardMiddleware?: boolean;
    generateDocs?: boolean;
    docs?: APILoveDocsOptions;
}
export interface APIMetaData {
    apiOptions: APIOptions;
    path: string;
    endpointOptions: APIEndpointOptions[];
}
export declare class APILove {
    static app: any;
    static getAPIMetadata(options: APILoveOptions): APIMetaData[];
    static start(options: APILoveOptions): any;
}
export interface APIParameterDocsOptions {
    description?: string;
    typeDescription?: string;
}
export interface APIParameterOptions {
    /**
     * If set to true, an error will not be thrown to the API caller if the value is not sent
     */
    optional?: boolean;
    /**
     * A default value to be used if one can't be found. This would be an equivalent shortcut for setting optional=true and providing a default value for your method property
     */
    defaultValue?: any;
    /**
     * One or more sources from which to look for this value. This is basically a path in the req object. So for example, a value of `query` would be equivalent to `req.query[myParamName]`
     * Multiple values can be defined, and whichever one results in a non-null value first will be used. Defaults to ["params", "query", "body", "cookie", "headers"].
     */
    sources?: string[] | string;
    docs?: APIParameterDocsOptions;
}
export declare function APIParameter(options: APIParameterOptions): (target: any, key: any, parameterIndex: number) => void;
export interface APIEndpointDocsOptions {
    title?: string;
    description?: string;
}
export interface APIEndpointOptions {
    method?: string;
    path?: string;
    middleware?: ((req: any, res: any, next?: any) => void)[] | ((req: any, res: any, next: any) => void);
    docs?: APIEndpointDocsOptions;
}
export declare function APIEndpoint(options?: APIEndpointOptions): (target: any, key: any, descriptor: any) => void;
export interface APIDocsOptions {
    title?: string;
    intro?: string;
}
export interface APIOptions {
    docs?: APIDocsOptions;
}
export declare function API(options?: APIOptions): (constructor: Function) => void;
export { APIConfig };
export { APIError };
export { APIResponse };
export { APIUtils };
export { KVService as APIKVService };
export { FileService as APIFileService };
export { EnvVarSync };
