export declare class Utils {
    static getRawTypeName(obj: any): any;
    static convertToType(value: any, convertToType: string): any;
    static toBoolean(input: any): any;
    static coalesce(...inputArgs: any[]): any;
    static getFunctionParamNames(fn: Function): string[];
}
