import * as express from "express";
import {defaults, get, set, isNil, each, map, toString, toNumber, isArray, isString, isNaN} from "lodash";
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

export type APIParameterSource = "param" | "query" | "body" | "cookie" | "header" | "any";

export interface APIParameterOptions {
    optional?: boolean;
    validator?: (value: any) => boolean;
    sources?: APIParameterSource | APIParameterSource[];
    rawName?: string; // This is the raw name of the API parameter— use this if the function name differs from the name you expect in the API
}

export function APIParameter(options?: APIParameterOptions) {
    return function (target: Object, key: string | symbol, parameterIndex: number) {
        let handlerData: HandlerData = get(target.constructor.prototype, `__handlerData.${key.toString()}`, {});
        set(handlerData, `handlerParameterData.${parameterIndex}.paramOptions`, options);
        set(target.constructor.prototype, `__handlerData.${key.toString()}`, handlerData);
    }
}

export interface APIEndpointOptions {
    method?: string; // Defaults to GET
    path?: string; // Defaults to /
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
            set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, parameterMetadata[parameterIndex].name);
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

    static createValidationError(errors: { name: string, message: string }[]) {
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

    constructor(req, res) {
        this.req = req;
        this.res = res;
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
        return true;
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
            let validationErrors: { name: string, message: string }[] = [];

            // Loop through each parameter in our function and pull it from the request
            for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
                let paramData: HandlerParameterData = handlerData.handlerParameterData[index];
                let paramName = get(paramData, "paramOptions.rawName", handlerData.handlerParameterNames[index]);

                if (paramData.paramType === "APIResponse") {
                    continue;
                }

                let paramSources: APIParameterSource[] = get(paramData, "paramOptions.sources", ["any"]);
                let paramValues = [];

                if (!isArray(paramSources)) {
                    paramSources = [(paramSources as any)];
                }

                for (let paramSource of paramSources) {
                    if (paramSource === "param" || paramSource === "any") {
                        paramValues.push(req.params[paramName]);
                    }
                    if (paramSource === "query" || paramSource === "any") {
                        paramValues.push(req.query[paramName]);
                    }
                    if (paramSource === "body" || paramSource === "any") {
                        paramValues.push(get(req, "body", {})[paramName]);
                    }
                    if (paramSource === "cookie" || paramSource === "any") {
                        paramValues.push(get(req, "cookie", {})[paramName]);
                    }
                    if (paramSource === "header" || paramSource === "any") {
                        paramValues.push(req.get(paramName));
                    }
                }

                let argValue = Utils.coalesce.apply(Utils, paramValues);

                if (isNil(argValue)) {

                    // Is this parameter required?
                    if (!get(paramData, "paramOptions.optional", false)) {
                        validationErrors.push({
                            name: paramName,
                            message: "missing"
                        });
                    }

                    handlerArgs.push(undefined);
                    continue;
                }

                switch (paramData.paramType) {
                    case "Number": {
                        argValue = toNumber(argValue);

                        if (isNaN(argValue)) {
                            validationErrors.push({
                                name: paramName,
                                message: "invalid"
                            });
                        }

                        break;
                    }
                    case "String":
                    default: {
                        argValue = toString(argValue);
                        break;
                    }
                }

                let validator = get(paramData, "paramOptions.validator");
                if (!isNil(validator)) {
                    if (!validator(argValue)) {
                        validationErrors.push({
                            name: paramName,
                            message: "invalid"
                        });
                    }
                }

                handlerArgs.push(argValue);
            }

            if (validationErrors.length > 0) {
                apiResponse.withError(APIError.createValidationError(validationErrors));
                return;
            }

            handlerArgs.push(apiResponse);
            handlerData.handlerFunction.apply(this, handlerArgs);
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
            this.app[options.method].apply(this.app, argsArray);
        });
    }
}