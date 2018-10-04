export declare class Utils {
    static convertToType(value: any, typeString: string): any;
    static toBoolean(input: any): any;
    static coalesce(...inputArgs: any[]): any;
    private static FN_ARGS;
    private static FN_ARG_SPLIT;
    private static FN_ARG;
    private static STRIP_COMMENTS;
    static getFunctionParamNames(fn: Function): string[];
}
