import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import {get, isNil, set, defaultsDeep, each, castArray, has, isNaN} from "lodash";
import {APIConfig} from "./lib/APIConfig";
import * as path from "path";
import {APIUtils} from "./lib/APIUtils";
import "reflect-metadata";
import {APIResponse} from "./lib/APIResponse";
import {APIError} from "./lib/APIError";
import {KVService} from "./lib/Services/KeyValue/KVService";
import {FileService} from "./lib/Services/File/FileService";
import {EnvVarSync} from "./lib/Services/Config";

interface HandlerParameterData {
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
    // The root path to the API, like /users
    apiPath?: string;

    // The path to the actual API code file
    require: string;

    // The title of the module/class in the API code file to load
    moduleName?: string;
}

export interface APILoveDocsOptions {
    title?: string;
    intro?: string;
}

export interface APILoveOptions {
    // One or more APIs to allow apilove to load. Remember these are lazy-loaded.
    apis?: APILoaderDefinition[];

    // By default cookieParser and bodyParser will be loaded. You can set this to false to prevent those from loading. Defaults to true.
    loadStandardMiddleware?: boolean;

    generateDocs?: boolean;

    docs?: APILoveDocsOptions
}

function _createHandlerWrapperFunction(handlerData: HandlerData, thisObject) {
    return (req, res, next) => {
        let apiResponse = new APIResponse(req, res, next);

        let handlerArgs = [];
        let validationErrors: { parameter: string, message: string }[] = [];

        // Loop through each parameter in our function and pull it from the request
        for (let index = 0; index < handlerData.handlerParameterNames.length; index++) {
            let paramData: HandlerParameterData = handlerData.handlerParameterData[index];
            let paramOptions: APIParameterOptions = get(paramData, "paramOptions", {});
            let paramName = handlerData.handlerParameterNames[index];

            // Ignore request and response parameters if the function asks for it
            if ((index === handlerData.handlerParameterNames.length - 1 || index === handlerData.handlerParameterNames.length - 2) && ["req", "request", "res", "response"].indexOf(paramName.toLowerCase()) >= 0) {
                continue;
            }

            let paramSources: string[] = castArray(get(paramOptions, "sources", ["params", "query", "body", "cookie", "headers"]));
            let paramValue;

            for (let paramSource of paramSources) {
                let paramValues = get(req, paramSource);

                if (isNil(paramValues)) {
                    continue;
                }

                if (has(paramValues, paramName)) {
                    paramValue = paramValues[paramName];
                    break;
                }
            }

            let argValue = APIUtils.coalesce(paramValue, paramOptions.defaultValue);

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

            argValue = APIUtils.convertToType(argValue, paramData.paramType);

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

        apiResponse.processHandlerFunction(thisObject, handlerData.handlerFunction, handlerArgs);
    };
}

function _getAPIModule(apiDefinition: APILoaderDefinition) {
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
    return APIUtils.coalesce(apiModule[moduleName], apiModule.default, apiModule);
}

function _loadAPI(apiRouter, apiDefinition: APILoaderDefinition) {

    let apiModule = _getAPIModule(apiDefinition);

    if (isNil(apiModule)) {
        return null;
    }

    let apiInstance;

    each(get(apiModule, "__handlerData", {}), (handlerData: HandlerData, name) => {

        // If this is an instance function, we need to create an instance of the class
        if (handlerData.isInstance && isNil(apiInstance)) {
            apiInstance = new apiModule();
        }

        let options: APIEndpointOptions = handlerData.options;
        let argsArray: any[] = [options.path];


        if (options.middleware) {
            argsArray = argsArray.concat(castArray(options.middleware));
        }

        let handlerWrapper = _createHandlerWrapperFunction(handlerData, handlerData.isInstance ? apiInstance : apiModule);
        argsArray.push(handlerWrapper);

        apiRouter[options.method.toLowerCase()].apply(apiRouter, argsArray);
    });
}

export interface APIMetaData
{
    apiOptions: APIOptions;
    path: string;
    endpointOptions: APIEndpointOptions[];
}

export class APILove {

    static app = express();

    static getAPIMetadata(options: APILoveOptions):APIMetaData[]
    {
        let metaData:APIMetaData[] = [];

        for (let api of get(options, "apis", []) as APILoaderDefinition[]) {
            let apiModule = _getAPIModule(api);

            let apiEndpoints = [];

            each(get(apiModule, "__handlerData", {}), (endpoint) => {
                apiEndpoints.push(endpoint.options);
            });

            metaData.push({
                apiOptions: get(apiModule, "__apiOptions", {}),
                path: api.apiPath,
                endpointOptions: apiEndpoints
            });
        }

        return metaData;
    }

    static start(options: APILoveOptions) {

        defaultsDeep(options, {
            generateDocs: true
        } as APILoveOptions);

        if (options.loadStandardMiddleware !== false) {
            this.app.use(cookieParser());
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({extended: false}));
            this.app.use(bodyParser.text());
        }

        this.app.use((req, res, next) => {
            req.APILove = {
                options: options
            };
            next();
        });

        if (options.generateDocs) {
            options.apis = [{
                apiPath: "/",
                require: "lib/APIDocs"
            } as APILoaderDefinition].concat(options.apis);
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

        if (APIConfig.RUN_AS_SERVER) {
            this.app.listen(APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig.WEB_PORT}`));
            return this.app;
        } else {
            let serverless = require("serverless-http");
            return serverless(this.app, {callbackWaitsForEmptyEventLoop: true});
        }
    }
}

export interface APIParameterDocsOptions {
    description?: string;
    typeDescription?: string;
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
     * One or more sources from which to look for this value. This is basically a path in the req object. So for example, a value of `query` would be equivalent to `req.query[myParamName]`
     * Multiple values can be defined, and whichever one results in a non-null value first will be used. Defaults to ["params", "query", "body", "cookie", "headers"].
     */
    sources?: string[] | string;

    docs?: APIParameterDocsOptions;
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

export interface APIEndpointDocsOptions {
    title?: string;
    description?: string;
}

export interface APIEndpointOptions {
    // The method to be used when requesting this endpoint. Defaults to "get".
    method?: string;

    // The path to reach this endpoint. Defaults to "/".
    path?: string;

    // Any express.js middleware functions you want to be executed before invoking this method. Useful for things like authentication.
    middleware?: ((req, res, next?) => void)[] | ((req, res, next) => void);

    docs?: APIEndpointDocsOptions;
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
            set(handlerData, `handlerParameterData.${parameterIndex}.paramType`, APIUtils.getRawTypeName(parameterMetadata[parameterIndex].prototype));
            set(handlerData, `handlerParameterData.${parameterIndex}.paramName`, parameterNames[parameterIndex]);
        }

        set(theClass, `__handlerData.${key}`, handlerData);
    }
}

export interface APIDocsOptions {
    title?: string;
    intro?: string;
}

export interface APIOptions {
    docs?: APIDocsOptions;
}

export function API(options?: APIOptions) {
    return function (constructor: Function) {
        set(constructor, `__apiOptions`, options);
    }
}

// Re-export stuff
// TODO: do we need to reconsider this? Is this causing unneeded memory usage if none of these end up getting used?
export {APIConfig};
export {APIError};
export {APIResponse};
export {APIUtils};
export {KVService as APIKVService};
export {FileService as APIFileService};
export {EnvVarSync};