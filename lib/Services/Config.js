"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const APIUtils_1 = require("../APIUtils");
require("reflect-metadata");
function EnvVarSync(target, key) {
    let envVar = process.env[key];
    // If we have an environment var defined, use it
    if (!lodash_1.isNil(envVar)) {
        let metadata = Reflect.getMetadata("design:type", target, key);
        let paramType = metadata.name;
        try {
            target[key] = APIUtils_1.APIUtils.convertToType(envVar, paramType);
        }
        catch (e) {
            console.error(`Unable to parse environment variable named ${key}`);
        }
    }
    // If we don't have an env var defined, assign the value of this to it
    else {
        process.env[key] = target[key];
    }
}
exports.EnvVarSync = EnvVarSync;
//# sourceMappingURL=Config.js.map