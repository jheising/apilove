import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {get, isNil, set, defaultsDeep, each, castArray, has, isNaN, isFunction} from "lodash";
import {APIConfig} from "./lib/APIConfig";
import path from "path";
import {APIUtils} from "./lib/APIUtils";
import "reflect-metadata";
import {APIResponse} from "./lib/APIResponse";
import {APIError} from "./lib/APIError";
import {KVService} from "./lib/Services/KeyValue/KVService";
import {FileService} from "./lib/Services/File/FileService";
import {EnvVarSync} from "./lib/Services/Config";
import {APIAuthUser, APIAuthUtils} from "./lib/APIAuthUtils";

interface HandlerParameterData {
    paramRawType: string;
    paramType: string;
    paramName: string;
    paramOptions: APIParameterOptions;
}

interface HandlerData {
    isInstance: boolean;
    options: APIEndpointOptions;
    handlerFunction: Function;
    handlerParameterNames: string[];
    handlerParameterData: { [paramIndex: number]: HandlerParameterData };
}

export interface APILoaderDefinition {
    apiPath?: string;
    require: string | (() => any);
    moduleName?: string;
}

export interface APILoveOptions {

    // One or more APIs to allow apilove to load. Remember these are lazy-loaded.
    apis?: APILoaderDefinition[];

    // By default cookieParser and bodyParser will be loaded. You can set this to false to prevent those from loading. Defaults to true.
    loadStandardMiddleware?: boolean;

    // Any other express.js middleware you want loaded before requests make it to apilove.
    middleware?: any[];

    // Override default express.js and APILove error handling
    defaultErrorHandler?: (error, req, res, next) => void;

    // This can be used to provide a default output for all requests. Useful to return a 404 or other default page.
    defaultRouteHandler?: (req, res) => void;

    callbackWaitsForEmptyEventLoop?: boolean;
}

function _createHandlerWrapperFunction(handlerData: HandlerData, thisObject) {
    return (req, res, next) => {

        let apiResponse = new APIResponse(req, res, next);

        // Does this require authentication?
        if (handlerData.options.requireAuthentication) {
            if (!req.auth || !req.auth.isAuthenticated || req.auth.isExpired) {
                apiResponse.withError(APIError.create401UnauthorizedError());
                return;
            }
        }

        let handlerArgs = [];
        let validationErrors: { parameter: string, message: string }[] = [];

        // Loop through each parameter in our function and pull it from the request
        for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
            let paramData: HandlerParameterData = handlerData.handlerParameterData[index];
            let paramOptions: APIParameterOptions = get(paramData, "paramOptions", {});
            let paramName = APIUtils.coalesce(paramOptions.rawName, handlerData.handlerParameterNames[index]);

            // Ignore request and response parameters if the function asks for it
            if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                continue;
            }

            let paramSources: string[] = castArray(get(paramOptions, "sources", ["params", "query", "body", "cookie", "headers"]));
            let paramValue;

            if (req.auth && paramData.paramType === "APIAuthUser") {
                paramValue = APIAuthUtils.getAPIAuthUserFromAuthCredentials(req.auth);
            } else {
                for (let paramSource of paramSources) {
                    let paramValues = get(req, paramSource);

                    if (isNil(paramValues)) {
                        continue;
                    }

                    if (paramOptions.includeFullSource ||
                        (/[\.\[\]]/g).test(paramSource) // If the source contains any of the characters ".[]" (ie a path), assume the developer meant to include the full source.
                    ) {
                        paramValue = paramValues;
                        break;
                    } else {
                        if (has(paramValues, paramName)) {
                            paramValue = paramValues[paramName];
                            break;
                        }
                    }
                }
            }

            let argValue = APIUtils.coalesce(paramValue, paramOptions.defaultValue);

            if (paramOptions.processor) {
                try {
                    argValue = paramOptions.processor(argValue, req);
                } catch (error) {
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

            argValue = APIUtils.convertToType(argValue, paramData.paramRawType);

            if (isNil(argValue) || isNaN(argValue)) {
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

        apiResponse.processHandlerFunction(thisObject, handlerData.handlerFunction, handlerArgs, handlerData.options.disableFriendlyResponse, handlerData.options.successResponse);
    };
}

function _loadAPI(apiRouter, apiDefinition: APILoaderDefinition) {

    let apiClass;

    if (isFunction(apiDefinition.require)) {
        apiClass = apiDefinition.require();
    } else {
        let apiModule;
        try {
            apiModule = require(path.resolve(process.cwd(), apiDefinition.require));
        } catch (e) {
            console.error(e);
            return null;
        }

        if (isNil(apiModule)) {
            return null;
        }

        let moduleName = APIUtils.coalesce(apiDefinition.moduleName, path.basename(apiDefinition.require));
        apiClass = APIUtils.coalesce(apiModule[moduleName], apiModule.default, apiModule);
    }

    let apiInstance;

    each(get(apiClass, "__handlerData", {}), (handlerData: HandlerData, name) => {

        // If this is an instance function, we need to create an instance of the class
        if (handlerData.isInstance && isNil(apiInstance)) {
            apiInstance = new apiClass();
        }

        let options: APIEndpointOptions = handlerData.options;
        let argsArray: any[] = [options.path];


        if (options.middleware) {
            argsArray = argsArray.concat(castArray(options.middleware));
        }

        let handlerWrapper = _createHandlerWrapperFunction(handlerData, handlerData.isInstance ? apiInstance : apiClass);
        argsArray.push(handlerWrapper);

        apiRouter[options.method.toLowerCase()].apply(apiRouter, argsArray);
    });
}

export class APILove {

    static app = express();

    static start(options: APILoveOptions) {

        if (options.loadStandardMiddleware !== false) {
            this.app.use(cookieParser());
            this.app.use(bodyParser.json({limit: "50mb"}));
            this.app.use(bodyParser.urlencoded({limit: "50mb", extended: false, parameterLimit: 50000}));
            this.app.use(bodyParser.text({limit: "50mb"}));
            this.app.use((req, res, next) => {
                req.auth = APIAuthUtils.getAuthCredentialsFromRequest(req, true);
                next();
            });
        }

        for (let mw of get(options, "middleware", [])) {
            this.app.use(mw);
        }

        // Here we load our APIs, but we only load them when requested
        for (let api of get(options, "apis", []) as APILoaderDefinition[]) {

            if (isNil(api.apiPath)) {
                api.apiPath = "";
            }

            if (APIConfig.LAZY_LOAD_APIS) {
                let apiRouter;

                this.app.use(api.apiPath, (req, res, next) => {

                    // Lazy load our API
                    if (!apiRouter) {
                        apiRouter = express.Router();
                        _loadAPI(apiRouter, api);
                    }

                    apiRouter(req, res, next);
                });
            } else {
                let apiRouter = express.Router();
                _loadAPI(apiRouter, api);
                this.app.use(api.apiPath, apiRouter);
            }
        }

        if (!isNil(options.defaultRouteHandler)) {
            this.app.use(options.defaultRouteHandler);
        }

        // Setup our default error handler
        if (!isNil(options.defaultErrorHandler)) {
            this.app.use(options.defaultErrorHandler);
        } else {
            this.app.use((error, req, res, next) => {

                if (error instanceof APIError) {
                    let apiError = error as APIError;
                    res.status(apiError.statusCode).send(APIConfig.OUTPUT_HAPI_RESULTS ? apiError.hapiOut() : apiError.out());
                } else {
                    let apiResponse = new APIResponse(res, res);
                    apiResponse.withError(error);
                }

            });
        }


        if (APIConfig.RUN_AS_SERVER) {
            this.app.listen(APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig.WEB_PORT}`));
            return this.app;
        } else {
            let serverless = require("serverless-http");
            return serverless(this.app, {callbackWaitsForEmptyEventLoop: !!options.callbackWaitsForEmptyEventLoop});
        }
    }
}

export interface APIParameterOptions {

    /**
     * If set to true, an error will not be thrown to the API caller if the value is not sent
     */
    optional?: boolean;

    /**
     * A default value to be used if one can't be found. This would be an equivalent shortcut for setting optional=true and providing a default value for your method property
     */
    defaultValue?: any;

    /**
     * A synchronous function that can be used to transform an incoming parameter into something else. Can also be used as validation by throwing an error.
     * You also get access to the raw express.js req object if you want it.
     */
    processor?: (value: any, req?) => any;

    /**
     * One or more sources from which to look for this value. This is basically a path in the req object. So for example, a value of `query` would be equivalent to `req.query[myParamName]`
     * Multiple values can be defined, and whichever one results in a non-null value first will be used. Defaults to ["params", "query", "body", "cookie", "headers"].
     */
    sources?: string[] | string;

    /**
     * If set to true, the entire source will be returned instead of looking for a particular value. Defaults to false.
     *
     * Examples:
     *
     * The following would look for something named `userData` in the query params and return that.
     * @APIParameter({sources:["query"]})
     * userData:string
     *
     * The following would take all the query params and return them as an object
     * @APIParameter({sources:["query"], includeFullSource:true})
     * userData:{[paramName:string] : any}
     */
    includeFullSource?: boolean;

    /**
     * This is the raw name of the parameter to look for in cases where the name can't be represented as a valid javascript variable name.
     * Examples usages might be when looking for a header like "content-type" or a parameter named "function"
     */
    rawName?: string;
}

export function APIParameter(options: APIParameterOptions) {
    return function (target, key, parameterIndex: number) {
        let isInstance = isNil(target.prototype);
        let theClass = isInstance ? target.constructor : target.prototype.constructor;

        let handlerData: HandlerData = get(theClass, `__handlerData.${key}`, {});
        set(handlerData, `handlerParameterData.${parameterIndex}.paramOptions`, options);
        set(theClass, `__handlerData.${key}`, handlerData);
    }
}

export interface APIEndpointOptions {
    // The method to be used when requesting this endpoint. Defaults to "get".
    method?: string;

    // The path to reach this endpoint. Defaults to "/".
    path?: string;

    // Any express.js middleware functions you want to be executed before invoking this method. Useful for things like authentication.
    middleware?: ((req, res, next?) => void)[] | ((req, res, next) => void);

    // Turn this on if you want to return data as-is and not in HAPI format
    disableFriendlyResponse?: boolean;

    // Specify a function here to handle the response yourself
    successResponse?: (responseData: any, res) => void;

    // If set to true, a valid JWT must be present in the request, otherwise a 401 error will be thrown
    requireAuthentication?: boolean;
}

export function APIEndpoint(options?: APIEndpointOptions) {
    return function (target, key, descriptor) {

        let isInstance = isNil(target.prototype);
        let theClass = isInstance ? target.constructor : target.prototype.constructor;

        let handlerData: HandlerData = get(theClass, `__handlerData.${key}`, {});

        options = defaultsDeep({}, options, {
            method: "get",
            path: "/"
        });

        let parameterMetadata = Reflect.getMetadata("design:paramtypes", target, key);
        let parameterNames = APIUtils.getFunctionParamNames(descriptor.value);

        handlerData.isInstance = isInstance;
        handlerData.handlerFunction = descriptor.value;
        handlerData.options = options;
        handlerData.handlerParameterNames = parameterNames;

        for (let parameterIndex = 0; parameterIndex < parameterNames.length; parameterIndex++) {
            set(handlerData, `handlerParameterData.${parameterIndex}.paramRawType`, APIUtils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, parameterMetadata[parameterIndex].name);
            set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }

        set(theClass, `__handlerData.${key}`, handlerData);
    }
}

// Re-export stuff
// TODO: do we need to reconsider this? Is this causing unneeded memory usage if none of these end up getting used?
export {
    APIConfig,
    APIAuthUtils,
    APIError,
    APIResponse,
    APIUtils,
    KVService as APIKVService,
    FileService as APIFileService,
    EnvVarSync
};