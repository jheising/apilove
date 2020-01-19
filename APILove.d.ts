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
export interface APILoveOptions {
    apis?: APILoaderDefinition[];
    loadStandardMiddleware?: boolean;
    middleware?: any[];
    defaultErrorHandler?: (error: any, req: any, res: any, next: any) => void;
    defaultRouteHandler?: (req: any, res: any) => void;
    callbackWaitsForEmptyEventLoop?: boolean;
}
export declare class APILove {
    static app: any;
    static start(options: APILoveOptions): any;
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
     * A synchronous function that can be used to transform an incoming parameter into something else. Can also be used as validation by throwing an error.
     * You also get access to the raw express.js req object if you want it.
     */
    processor?: (value: any, req?: any) => any;
    /**
     * One or more sources from which to look for this value. This is basically a path in the req object. So for example, a value of `query` would be equivalent to `req.query[myParamName]`
     * Multiple values can be defined, and whichever one results in a non-null value first will be used. Defaults to ["params", "query", "body", "cookie", "headers"].
     */
    sources?: string[] | string;
    /**
     * If set to true, the entire source will be returned instead of looking for a particular value. Defaults to false.
     *
     * Examples:
     *
     * The following would look for something named `userData` in the query params and return that.
     * @APIParameter({sources:["query"]})
     * userData:string
     *
     * The following would take all the query params and return them as an object
     * @APIParameter({sources:["query"], includeFullSource:true})
     * userData:{[paramName:string] : any}
     */
    includeFullSource?: boolean;
    /**
     * This is the raw name of the parameter to look for in cases where the name can't be represented as a valid javascript variable name.
     * Examples usages might be when looking for a header like "content-type" or a parameter named "function"
     */
    rawName?: string;
}
export declare function APIParameter(options: APIParameterOptions): (target: any, key: any, parameterIndex: number) => void;
export interface APIEndpointOptions {
    method?: string;
    path?: string;
    middleware?: ((req: any, res: any, next?: any) => void)[] | ((req: any, res: any, next: any) => void);
    disableFriendlyResponse?: boolean;
    successResponse?: (responseData: any, res: any) => void;
}
export declare function APIEndpoint(options?: APIEndpointOptions): (target: any, key: any, descriptor: any) => void;
export { APIConfig };
export { APIError };
export { APIResponse };
export { APIUtils };
export { KVService as APIKVService };
export { FileService as APIFileService };
export { EnvVarSync };
