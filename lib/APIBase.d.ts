import "reflect-metadata";
export declare type APIParameterSource = "param" | "query" | "body" | "cookie" | "header" | "any";
export interface APIParameterOptions {
    optional?: boolean;
    validator?: (value: any) => boolean;
    sources?: APIParameterSource | APIParameterSource[];
    rawName?: string;
}
export declare function APIParameter(options?: APIParameterOptions): (target: Object, key: string | symbol, parameterIndex: number) => void;
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
        name: string;
        message: string;
    }[]): APIError;
    static _rawErrorOut(error: Error): any;
    out(includeRawError?: boolean): any;
    hapiOut(includeRawError?: boolean): any;
}
export declare class APIResponse {
    req: any;
    res: any;
    constructor(req: any, res: any);
    withError(error: any, hapiOutput?: boolean): boolean;
    withSuccess(data?: any, statusCode?: number, hapiOutput?: boolean): void;
}
export declare class APIBase {
    app: any;
    private _createHandlerWrapperFunction;
    constructor();
}
