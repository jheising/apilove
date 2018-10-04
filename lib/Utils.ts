import {isBoolean, isNil, toString, castArray} from "lodash";
import * as getArguments from "function-arguments";

export class Utils {

    static convertToType(value:any, typeString:string)
    {
        let convertedValue;

        switch(typeString)
        {
            case "String":
            {
                convertedValue = toString(value);
                break;
            }
            case "Boolean":
            {
                convertedValue = Utils.toBoolean(value);
                break;
            }
            case "Array":
            {
                convertedValue = castArray(value);
                break;
            }
            default:
            {
                convertedValue = JSON.parse(value);
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

    static coalesce(...inputArgs:any[]) {

        for(let inputArg of inputArgs)
        {
            if(!isNil(inputArg) && inputArg != "")
            {
                return inputArg;
            }
        }

        return null;
    }

    static getFunctionParamNames(fn:Function):string[]
    {
        return getArguments(fn);
    }
}