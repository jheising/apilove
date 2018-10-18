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
