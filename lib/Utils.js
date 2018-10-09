"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const getArguments = require("function-arguments");
class Utils {
    static getRawTypeName(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }
    static convertToType(value, convertToType) {
        if (lodash_1.isNil(convertToType)) {
            return value;
        }
        let convertedValue;
        let rawValueType = Utils.getRawTypeName(value);
        // No conversion needed
        if (rawValueType === convertToType) {
            return value;
        }
        // Objects and Arrays can only be converted to JSON strings
        if (rawValueType === "Object" || rawValueType === "Array") {
            if (convertToType === "String") {
                try {
                    return JSON.stringify(value);
                }
                catch (e) {
                }
            }
            return undefined;
        }
        switch (convertToType) {
            case "String": {
                convertedValue = lodash_1.toString(value);
                break;
            }
            case "Boolean": {
                convertedValue = Utils.toBoolean(value);
                break;
            }
            case "Number": {
                convertedValue = lodash_1.toNumber(value);
                break;
            }
            case "Array": {
                convertedValue = lodash_1.castArray(value);
                break;
            }
            case "Object": {
                try {
                    convertedValue = JSON.parse(value);
                }
                catch (e) {
                    convertedValue = value;
                }
            }
        }
        return convertedValue;
    }
    static toBoolean(input) {
        if (lodash_1.isBoolean(input)) {
            return input;
        }
        return (/(1|true|yes)/i).test(input);
    }
    static coalesce(...inputArgs) {
        for (let inputArg of inputArgs) {
            if (!lodash_1.isNil(inputArg) && inputArg != "") {
                return inputArg;
            }
        }
        return null;
    }
    static getFunctionParamNames(fn) {
        return getArguments(fn);
    }
    static shouldCallbackWithError(error, callback) {
        if (error) {
            if (callback)
                callback(error);
            return true;
        }
        return false;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map