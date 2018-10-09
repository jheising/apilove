"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const lodash_1 = require("lodash");
const APIBase_1 = require("./lib/APIBase");
const APIConfig_1 = require("./lib/APIConfig");
const path = require("path");
const Utils_1 = require("./lib/Utils");
class APILove {
    static _loadAPI(api) {
        let apiModule;
        try {
            apiModule = require(path.resolve(process.cwd(), api.require));
        }
        catch (e) {
            console.error(e);
            return null;
        }
        if (lodash_1.isNil(apiModule)) {
            return null;
        }
        let moduleName = Utils_1.Utils.coalesce(api.moduleName, path.basename(api.require));
        let apiClass = Utils_1.Utils.coalesce(apiModule[moduleName], apiModule.default, apiModule);
        return new apiClass();
    }
    static start(options) {
        const app = express();
        app.use(cookieParser());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.text());
        for (let mw of lodash_1.get(options, "middleware", [])) {
            app.use(mw);
        }
        // Here we load our APIs, but we only load them when requested
        for (let api of lodash_1.get(options, "apis", [])) {
            if (lodash_1.isNil(api.apiPath)) {
                api.apiPath = "/";
            }
            if (APIConfig_1.APIConfig.LAZY_LOAD_APIS) {
                let apiInstance;
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
            let apiResponse = new APIBase_1.APIResponse(res, res);
            apiResponse.withError(error);
        });
        if (APIConfig_1.APIConfig.RUN_AS_SERVER) {
            app.listen(APIConfig_1.APIConfig.WEB_PORT, () => console.log(`API listening on port ${APIConfig_1.APIConfig.WEB_PORT}`));
            return app;
        }
        else {
            let serverless = require("serverless-http");
            return serverless(app, { callbackWaitsForEmptyEventLoop: true });
        }
    }
}
exports.APILove = APILove;
// Re-export stuff
__export(require("./lib/APIBase"));
__export(require("./lib/APIConfig"));
__export(require("./lib/Services/Config"));
//# sourceMappingURL=APILove.js.map