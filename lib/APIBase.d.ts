import "reflect-metadata";
export interface APIParameterOptions {
    optional?: boolean;
    defaultValue?: any;
    processor?: (value: any, req?: any) => any;
    sources?: string[] | string;
    rawName?: string;
}
export declare function APIParameter(options: APIParameterOptions): (target: Object, key: string | symbol, parameterIndex: number) => void;
export interface APIEndpointOptions {
    method?: string;
    path?: string;
    middleware?: ((req: any, res: any, next?: any) => void)[] | ((req: any, res: any, next: any) => void);
    successResponse?: (responseData: any, res: any) => void;
}
export declare function APIEndpoint(options?: APIEndpointOptions): (target: any, key: any, descriptor: any) => void;
export declare class APIError {
    id: string;
    friendlyMessage: any;
    rawError: Error;
    statusCode: number;
    extraData: any;
    constructor(friendlyMessage: any, rawError?: Error, statusCode?: number, extraData?: any);
    static shouldReject(error: Error, rejectFunction: Function): boolean;
    static createValidationError(errors: {
        parameter: string;
        message: string;
    }[]): APIError;
    static create404NotFoundError(): Error;
    static create401UnauthorizedError(): Error;
    static createAPIFriendlyError(message: string, statusCode?: number): Error;
    private static _rawErrorOut;
    out(includeRawError?: boolean): any;
    hapiOut(includeRawError?: boolean): any;
}
export declare class APIResponse {
    req: any;
    res: any;
    constructor(req?: any, res?: any);
    static withError(req: any, res: any, error: any, hapiOutput?: boolean): boolean;
    processHandlerFunction(target: any, handlerFunction: Function, handlerArgs?: any[], successResponseHandler?: (responseData: any, res: any) => void): void;
    withError(error: any, hapiOutput?: boolean): boolean;
    withSuccess(data?: any, statusCode?: number, hapiOutput?: boolean): void;
}
export declare class APIBase {
    app: any;
    private _createHandlerWrapperFunction;
    constructor();
}
