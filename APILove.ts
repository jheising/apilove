import * as express from "express";
import * as bodyParser from "body-parser";
import {get, isNil} from "lodash";
import {APIBase, APIResponse} from "./lib/APIBase";
import {APIConfig} from "./lib/APIConfig";
import * as path from "path";
import {Utils} from "./lib/Utils";

export interface APILoaderDefinition {
    apiPath?: string;
    require: string;
    moduleName?: string;
}

export interface APILoveOptions {
    apis?: APILoaderDefinition[];
    middleware?: [];
}

export class APILove {

    private static _loadAPI(api: APILoaderDefinition): APIBase {

        let apiModule;
        try {
            apiModule = require(path.resolve(process.cwd(), api.require));
        }
        catch (e) {
            console.error(e);
            return null;
        }

        if (isNil(apiModule)) {
            return null;
        }

        let moduleName = Utils.coalesce(api.moduleName, path.basename(api.require));

        let apiClass = Utils.coalesce(apiModule[moduleName], apiModule.default, apiModule);

        return new apiClass();
    }

    static start(options: APILoveOptions) {

        const app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.text());

        for (let mw of get(options, "middleware", [])) {
            app.use(mw);
        }

        // Here we load our APIs, but we only load them when requested
        for (let api of get(options, "apis", []) as APILoaderDefinition[]) {

            if (isNil(api.apiPath)) {
                api.apiPath = "/";
            }

            if (APIConfig.LAZY_LOAD_APIS) {

                let apiInstance: APIBase;

                app.use(api.apiPath, (req, res, next) => {

                    // Lazy load our API
                    if (!apiInstance) {
                        apiInstance = APILove._loadAPI(api);

                        if (!apiInstance) {
                            console.error(`Failed to load API at '${api.require}'`);
                            next();
                            return;
                        }
                    }

                    apiInstance.app(req, res, next);
                });
            }
            else {
                let apiInstance = APILove._loadAPI(api);

                if (!apiInstance) {
                    console.error(`Failed to load API at '${api.require}'`);
                    continue;
                }

                app.use(api.apiPath, apiInstance.app);
            }
        }

        // Default error handler
        app.use((error, req, res, next) => {
            let apiResponse = new APIResponse(res, res);
            apiResponse.withError(error);
        });

        if (APIConfig.RUN_AS_SERVER) {
            app.listen(APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig.WEB_PORT}`));
            return app;
        }
        else {
            let serverless = require("serverless-http");
            return serverless(app, {callbackWaitsForEmptyEventLoop: true});
        }
    }
}

// Re-export stuff
export * from "./lib/APIBase";
export * from "./lib/APIConfig";
export * from "./lib/Services/Config";