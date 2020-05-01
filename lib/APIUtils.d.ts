export declare class APIUtils {
    static getRawTypeName(obj: any): any;
    static generateShortID(): any;
    static generateLongID(length?: number): string;
    static slugify(text: string): string;
    static convertToType(value: any, convertToType: string): any;
    static toBoolean(input: any): boolean;
    static coalesce(...inputArgs: any[]): any;
    static getFunctionParamNames(fn: Function): string[];
    private static _IV_LENGTH;
    private static _CRYPTO_ALG;
    private static _HASH_ALG;
    static encrypt(text: string, password?: string): string;
    static decrypt(text: string, password?: string): string;
    static hashString(text: string, encoding?: string): string;
    static hashMD5(text: string, encoding?: string): string;
    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    static createExpirationInSeconds(expirationInSeconds: number): number;
}
