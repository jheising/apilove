import {APIConfig} from "./APIConfig";
import * as shortid from "shortid";
import {get, isNil} from "lodash";

export class APIError {
    id: string;
    friendlyMessage: any;
    rawError: Error;
    statusCode: number;
    extraData: any;

    constructor(friendlyMessage: any, rawError?: Error, statusCode: number = 500, extraData?: any) {
        this.id = shortid.generate();

        // Is this already and API friendly error?
        if (get(rawError, "isAPIFriendly", false)) {
            this.friendlyMessage = (<any>rawError).message;
            this.statusCode = (<any>rawError).statusCode;
        }
        else {
            this.friendlyMessage = friendlyMessage;
            this.statusCode = statusCode;
        }

        this.rawError = rawError;
        this.extraData = extraData;
    }

    static shouldReject(error: Error, rejectFunction: Function) {
        if (!isNil(error)) {
            if (rejectFunction) {
                rejectFunction(error);
            }
            return true;
        }

        return false;
    }

    static createValidationError(errors: { parameter: string, message: string }[]) {
        return new APIError("validation_error", null, 400, errors);
    }

    static create404NotFoundError(): Error {
        return APIError.createAPIFriendlyError("not found", 404);
    }

    static create401UnauthorizedError(): Error {
        return APIError.createAPIFriendlyError("unauthorized", 401);
    }

    static createAPIFriendlyError(message: string, statusCode: number = 500): Error {
        let error = new Error(message);
        (<any>error).isAPIFriendly = true;
        (<any>error).statusCode = statusCode;
        return error;
    }

    private static _rawErrorOut(error: Error) {

        let errorData: any = {
            "error": error.toString()
        };

        let stack = error.stack;
        if (stack) {
            errorData.stack = stack.split('\n').map(function (line) {
                return line.trim();
            }).slice(1);
        }

        return errorData
    }

    out(includeRawError: boolean = APIConfig.DISPLAY_RAW_ERRORS) {
        let output: any = {
            "error": {
                "id": this.id,
                "message": this.friendlyMessage,
                "details": this.extraData,
            }
        };

        if (includeRawError && !isNil(this.rawError)) {
            output.error.raw_error = APIError._rawErrorOut(this.rawError);
        }

        return output;
    }

    hapiOut(includeRawError: boolean = APIConfig.DISPLAY_RAW_ERRORS) {
        let output: any = {
            "this": "failed",
            "with": this.statusCode,
            "because": {
                "message": this.friendlyMessage,
                "details": this.extraData
            },
            "id": this.id
        };

        if (includeRawError && !isNil(this.rawError)) {
            output.because.raw_error = APIError._rawErrorOut(this.rawError);
        }

        return output;
    }
}