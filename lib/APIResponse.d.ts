export declare class APIResponse {
    req: any;
    res: any;
    next: any;
    constructor(req?: any, res?: any, next?: any);
    static withError(req: any, res: any, error: any, hapiOutput?: boolean): void;
    processHandlerFunction(target: any, handlerFunction: Function, handlerArgs?: any[], disableFriendlyResponse?: boolean, successResponseHandler?: (responseData: any, res: any) => void): Promise<void>;
    withError(error: any, hapiOutput?: boolean): void;
    withSuccess(data?: any, statusCode?: number, hapiOutput?: boolean): void;
}
