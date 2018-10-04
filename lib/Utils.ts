import {isBoolean, isNil, toString} from "lodash";

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

    private static FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    private static FN_ARG_SPLIT = /,/;
    private static FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
    private static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    static getFunctionParamNames(fn:Function):string[]
    {
        let paramNames = [];
        let fnText = fn.toString().replace(this.STRIP_COMMENTS, '');
        let argDecl = fnText.match(this.FN_ARGS);

        for(let arg of argDecl[1].split(this.FN_ARG_SPLIT))
        {
            // @ts-ignore
            arg.replace(this.FN_ARG, function(all, underscore, name){
                paramNames.push(name);
            });
        }

        return paramNames;
    }
}