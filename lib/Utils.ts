import {isBoolean, isNil, toString, castArray, toNumber} from "lodash";
import * as getArguments from "function-arguments";

export class Utils {

    static getRawTypeName(obj){
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    static convertToType(value: any, convertToType: string):any {

        if(isNil(convertToType))
        {
            return value;
        }

        let convertedValue;
        let rawValueType = Utils.getRawTypeName(value);

        // No conversion needed
        if(rawValueType === convertToType)
        {
            return value;
        }

        // Objects and Arrays can only be converted to JSON strings
        if(rawValueType === "Object" || rawValueType === "Array")
        {
            if(convertToType === "String")
            {
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
                convertedValue = toString(value);
                break;
            }
            case "Boolean": {
                convertedValue = Utils.toBoolean(value);
                break;
            }
            case "Number": {
                convertedValue = toNumber(value);
                break;
            }
            case "Array": {
                convertedValue = castArray(value);
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

    static toBoolean(input: any) {
        if (isBoolean(input)) {
            return input;
        }

        return (/(1|true|yes)/i).test(input);
    }

    static coalesce(...inputArgs: any[]) {

        for (let inputArg of inputArgs) {
            if (!isNil(inputArg) && inputArg != "") {
                return inputArg;
            }
        }

        return null;
    }

    static getFunctionParamNames(fn: Function): string[] {
        return getArguments(fn);
    }
}