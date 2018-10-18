export declare class APIResponse {
    req: any;
    res: any;
    constructor(req?: any, res?: any);
    static withError(req: any, res: any, error: any, hapiOutput?: boolean): boolean;
    processHandlerFunction(target: any, handlerFunction: Function, handlerArgs?: any[], successResponseHandler?: (responseData: any, res: any) => void): void;
    withError(error: any, hapiOutput?: boolean): boolean;
    withSuccess(data?: any, statusCode?: number, hapiOutput?: boolean): void;
}
