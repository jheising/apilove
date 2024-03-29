import {APIConfig} from "./APIConfig";
import {APIError} from "./APIError";
import {get, isNil} from "lodash";
import {URL} from "url";

export class APIResponse {
    req;
    res;
    next;

    constructor(req?, res?, next?) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    static withError(req, res, error: any, hapiOutput: boolean = APIConfig.OUTPUT_HAPI_RESULTS) {
        return new APIResponse(req, res).withError(error, hapiOutput);
    }

    async processHandlerFunction(target: any, handlerFunction: Function, handlerArgs: any[] = [], disableFriendlyResponse?: boolean, successResponseHandler?: (responseData: any, res) => void) {
        // Add the req, and res to the end arguments if the function wants it
        handlerArgs = handlerArgs.concat([this.req, this.res]);

        let handlerData;

        try {
            const handlerOutput = handlerFunction.apply(target, handlerArgs);
            if (!(handlerOutput instanceof Promise)) {
                handlerData = handlerOutput;
            } else {
                handlerData = await handlerOutput;
            }
        } catch (error) {
            this.withError(error);
            return;
        }

        // If the data is a URL, consider this a redirect.
        if (handlerData instanceof URL) {
            this.res.redirect((<URL>handlerData).toString());
            return;
        }

        if (disableFriendlyResponse) {
            this.res.json(handlerData);
        } else if (!isNil(successResponseHandler)) {
            successResponseHandler(handlerData, this.res);
        } else {
            this.withSuccess(handlerData, 200);
        }
    }

    withError(error: any, hapiOutput: boolean = APIConfig.OUTPUT_HAPI_RESULTS) {

        if (this.res.headersSent || isNil(error)) {
            return;
        }

        let apiError: APIError;

        if (error instanceof APIError) {
            apiError = error;
        } else {
            apiError = new APIError("unknown", error);
        }

        if ((apiError.statusCode >= 500 && apiError.statusCode <= 599 && APIConfig.LOG_500_ERRORS) ||
            (apiError.statusCode >= 400 && apiError.statusCode <= 499 && APIConfig.LOG_400_ERRORS)) {
            console.error(apiError.out(true).error);
        }

        if (this.next) {
            // Let the standard error handler handle it
            this.next(apiError);
        } else {
            this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
        }
    }

    withSuccess(data?: any, statusCode: number = 200, hapiOutput: boolean = APIConfig.OUTPUT_HAPI_RESULTS) {

        if (this.res.headersSent) {
            return;
        }

        let output = data;

        if (hapiOutput) {
            output = {
                "this": "succeeded",
                "with": data
            }
        }

        this.res.status(statusCode).send(output);
    }
}