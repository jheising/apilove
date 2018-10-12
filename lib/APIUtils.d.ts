export declare class APIUtils {
    static getRawTypeName(obj: any): any;
    static convertToType(value: any, convertToType: string): any;
    static toBoolean(input: any): any;
    static coalesce(...inputArgs: any[]): any;
    static getFunctionParamNames(fn: Function): string[];
    private static _IV_LENGTH;
    private static _CRYPTO_ALG;
    private static _HASH_ALG;
    static encrypt(text: string, password?: string): string;
    static decrypt(text: string, password?: string): string;
    static slugify(text: string): string;
    static hashString(text: string): string;
    static hashMD5(text: string): string;
}
