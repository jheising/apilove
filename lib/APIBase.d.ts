import "reflect-metadata";
export declare type APIParameterSource = "param" | // Parameters in the URL, like /foo/:bar
"query" | // Query parameters in the URL, like /foo?what=bar
"body" | // The full body. If sent in JSON or application/x-www-form-urlencoded it will be converted to an object. If this is specified, it will override all others.
"cookie" | // Cookies
"header" | // Headers
"any";
export interface APIParameterOptions {
    optional?: boolean;
    default?: any;
    processor?: (value: any, req?: any) => any;
    sources?: APIParameterSource | APIParameterSource[];
    rawName?: string;
}
export declare function APIParameter(options: APIParameterOptions): (target: Object, key: string | symbol, parameterIndex: number) => void;
export interface APIEndpointOptions {
    method?: string;
    path?: string;
    middleware?: Function[];
}
export declare function APIEndpoint(options?: APIEndpointOptions): (target: any, key: any, descriptor: any) => void;
export declare class APIError {
    id: string;
    friendlyMessage: any;
    rawError: Error;
    statusCode: number;
    extraData: any;
    constructor(friendlyMessage: any, rawError?: Error, statusCode?: number, extraData?: any);
    static createValidationError(errors: {
        parameter: string;
        message: string;
    }[]): APIError;
    static _rawErrorOut(error: Error): any;
    out(includeRawError?: boolean): any;
    hapiOut(includeRawError?: boolean): any;
}
export declare class APIResponse {
    req: any;
    res: any;
    constructor(req?: any, res?: any);
    processHandlerFunction(target: any, handlerFunction: Function, handlerArgs?: any[]): void;
    withError(error: any, hapiOutput?: boolean): boolean;
    withSuccess(data?: any, statusCode?: number, hapiOutput?: boolean): void;
}
export declare class APIBase {
    app: any;
    private _createHandlerWrapperFunction;
    constructor();
}
