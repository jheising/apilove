import * as express from "express";
import {defaults, get, set, isNil, each, map, toString, toNumber, isArray, castArray, isString, isNaN} from "lodash";
import "reflect-metadata";
import {Utils} from "./Utils";
import {APIConfig} from "./APIConfig";
import * as shortid from "shortid";

interface HandlerParameterData {
    paramType: string;
    paramName: string;
    paramOptions: APIParameterOptions;
}

interface HandlerData {
    options: APIEndpointOptions;
    handlerFunction: Function;
    handlerParameterNames: string[];
    handlerParameterData: { [paramIndex: number]: HandlerParameterData };
}

export type APIParameterSource =
    "param" | // Parameters in the URL, like /foo/:bar
    "query" | // Query parameters in the URL, like /foo?what=bar
    "body" | // The full body. If sent in JSON or application/x-www-form-urlencoded it will be converted to an object. If this is specified, it will override all others.
    "cookie" | // Cookies
    "header" | // Headers
    "any"; // All of the above (except for body)

export interface APIParameterOptions {

    // If set to true, an error will not be thrown if the value is not sent
    optional?: boolean;

    // A default value to be used if one can't be found. This would be an equivalent shortcut for setting optional=true and providing a default value for your method property
    defaultValue?: any;

    // A synchronous function that can be used to transform an incoming parameter into something else. Can also be used as validation by throwing an error.
    // You also get access to the raw express.js req object if you want it.
    processor?: (value: any, req?) => any;

    // One or more sources from which to look for this value. "any" is the default value
    sources?: APIParameterSource | APIParameterSource[];

    // This is the raw name of the parameter to look for in cases where the name can't be represented as a valid javascript variable name.
    // Examples usages might be when looking for a header like "content-type" or a parameter named "function"
    rawName?: string;
}

export function APIParameter(options: APIParameterOptions) {
    return function (target: Object, key: string | symbol, parameterIndex: number) {
        let handlerData: HandlerData = get(target.constructor.prototype, `__handlerData.${key.toString()}`, {});
        set(handlerData, `handlerParameterData.${parameterIndex}.paramOptions`, options);
        set(target.constructor.prototype, `__handlerData.${key.toString()}`, handlerData);
    }
}

export interface APIEndpointOptions {
    // The method to be used when requesting this endpoint. Defaults to "get".
    method?: string;

    // The path to reach this endpoint. Defaults to "/".
    path?: string;

    // Any express.js middleware functions you want to be executed before invoking this method. Useful for things like authentication.
    middleware?: Function[];
}

export function APIEndpoint(options?: APIEndpointOptions) {
    return function (target, key, descriptor) {

        options = defaults({}, options, {
            method: "get",
            path: "/"
        });

        let handlerData: HandlerData = get(target.constructor.prototype, `__handlerData.${key.toString()}`, {});

        handlerData.handlerFunction = descriptor.value;
        handlerData.options = options;

        let parameterMetadata = Reflect.getMetadata("design:paramtypes", target, key);
        let parameterNames = Utils.getFunctionParamNames(descriptor.value);

        handlerData.handlerParameterNames = parameterNames;

        for (let parameterIndex = 0; parameterIndex < parameterNames.length; parameterIndex++) {
            set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, Utils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }

        set(target.constructor.prototype, `__handlerData.${key.toString()}`, handlerData);
    }
}

export class APIError {
    id: string;
    friendlyMessage: any;
    rawError: Error;
    statusCode: number;
    extraData: any;

    constructor(friendlyMessage: any, rawError?: Error, statusCode: number = 500, extraData?: any) {
        this.id = shortid.generate();
        this.friendlyMessage = friendlyMessage;
        this.rawError = rawError;
        this.statusCode = statusCode;
        this.extraData = extraData;
    }

    static createValidationError(errors: { parameter: string, message: string }[]) {
        return new APIError("validation_error", null, 400, errors);
    }

    static _rawErrorOut(error: Error) {

        //stack = stack.split('\n').map(function (line) { return line.trim(); });

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
                "id": this.id,
                "message": this.friendlyMessage,
                "details": this.extraData
            }
        };

        if (includeRawError && !isNil(this.rawError)) {
            output.because.raw_error = APIError._rawErrorOut(this.rawError);
        }

        return output;
    }
}

export class APIResponse {
    req;
    res;

    constructor(req?, res?) {
        this.req = req;
        this.res = res;
    }

    processHandlerFunction(target: any, handlerFunction: Function, handlerArgs: any[] = []) {
        // Add the req, and res to the end arguments if the function wants it
        handlerArgs = handlerArgs.concat([this.req, this.res]);

        let handlerPromise = handlerFunction.apply(target, handlerArgs);
        if (!(handlerPromise instanceof Promise)) {
            throw new Error(`API function named '${handlerFunction.name}' doesn't return a promise.`);
        }
        else {
            handlerPromise.then((data: any) => {
                this.withSuccess(data)
            }).catch((error: any) => {
                this.withError(error);
            });
        }
    }

    withError(error: any, hapiOutput: boolean = APIConfig.OUTPUT_HAPI_RESULTS) {
        if (isNil(error)) {
            return false;
        }

        let apiError: APIError;

        if (error instanceof APIError) {
            apiError = error;
        }
        else {
            apiError = new APIError("unknown", error);
        }

        if ((apiError.statusCode >= 500 && apiError.statusCode <= 599 && APIConfig.LOG_500_ERRORS) ||
            (apiError.statusCode >= 400 && apiError.statusCode <= 499 && APIConfig.LOG_400_ERRORS)) {
            console.error(JSON.stringify(apiError.out(true)));
        }

        this.res.status(apiError.statusCode).send(hapiOutput ? apiError.hapiOut() : apiError.out());
    }

    withSuccess(data?: any, statusCode: number = 200, hapiOutput: boolean = APIConfig.OUTPUT_HAPI_RESULTS) {

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

export class APIBase {
    app = express.Router();

    private _createHandlerWrapperFunction(handlerData: HandlerData) {

        return (req, res) => {
            let apiResponse = new APIResponse(req, res);

            let handlerArgs = [];
            let validationErrors: { parameter: string, message: string }[] = [];

            // Loop through each parameter in our function and pull it from the request
            for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
                let paramData: HandlerParameterData = handlerData.handlerParameterData[index];
                let paramOptions: APIParameterOptions = get(paramData, "paramOptions", {});
                let paramName = Utils.coalesce(paramOptions.rawName, handlerData.handlerParameterNames[index]);

                // Ignore request and response parameters if the function asks for it
                if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                    continue;
                }

                let paramSources: APIParameterSource[] = castArray(get(paramOptions, "sources", ["any"]));
                let paramValues = [];

                if (paramSources.indexOf("body") !== -1) {

                    let bodyValue = req.body;

                    if(!isNil(bodyValue))
                    {
                        paramValues.push(bodyValue);
                    }
                }
                else {
                    for (let paramSource of paramSources) {
                        if (paramSource === "param" || paramSource === "any") {
                            paramValues.push(req.params[paramName]);
                        }
                        if (paramSource === "query" || paramSource === "any") {
                            paramValues.push(req.query[paramName]);
                        }
                        if (paramSource === "cookie" || paramSource === "any") {
                            paramValues.push(get(req, "cookie", {})[paramName]);
                        }
                        if (paramSource === "header" || paramSource === "any") {
                            paramValues.push(req.get(paramName));
                        }
                    }
                }

                // Add a default value to the possible options
                paramValues.push(paramOptions.defaultValue);

                let argValue = Utils.coalesce.apply(Utils, paramValues);

                if (paramOptions.processor) {
                    try {
                        argValue = paramOptions.processor(argValue, req);
                    }
                    catch (error) {
                        validationErrors.push({
                            parameter: paramName,
                            message: error.message || error.toString()
                        });
                        continue;
                    }
                }

                if (isNil(argValue)) {

                    // Is this parameter required?
                    if (!get(paramOptions, "optional", false)) {
                        validationErrors.push({
                            parameter: paramName,
                            message: "missing"
                        });
                    }

                    handlerArgs.push(undefined);
                    continue;
                }

                argValue = Utils.convertToType(argValue, paramData.paramType);

                if(isNil(argValue) || isNaN(argValue))
                {
                    validationErrors.push({
                        parameter: paramName,
                        message: "invalid"
                    });
                    continue;
                }

                handlerArgs.push(argValue);
            }

            if (validationErrors.length > 0) {
                apiResponse.withError(APIError.createValidationError(validationErrors));
                return;
            }

            apiResponse.processHandlerFunction(this, handlerData.handlerFunction, handlerArgs);
        };
    }

    constructor() {
        each(this.constructor.prototype.__handlerData, (handlerData: HandlerData) => {
            let options: APIEndpointOptions = handlerData.options;
            let argsArray: any[] = [options.path];

            if (options.middleware) {
                argsArray = argsArray.concat(options.middleware);
            }

            let handlerWrapper = this._createHandlerWrapperFunction(handlerData);
            argsArray.push(handlerWrapper);
            this.app[options.method.toLowerCase()].apply(this.app, argsArray);
        });
    }
}