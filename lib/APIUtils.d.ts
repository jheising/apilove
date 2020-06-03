/// <reference types="node" />
export declare type APIUtilsEncoding = BufferEncoding | "urlsafe";
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
    static bufferToString(buffer: Buffer, encoding: APIUtilsEncoding): string;
    static stringToBuffer(theString: string, encoding: APIUtilsEncoding): Buffer;
    static encrypt(content: string | Buffer, password?: string, encoding?: APIUtilsEncoding): string;
    static decrypt(content: string | Buffer, password?: string, encoding?: APIUtilsEncoding): string;
    static hashString(text: string, encoding?: APIUtilsEncoding): string;
    static hashMD5(text: string, encoding?: APIUtilsEncoding): string;
    /**
     * Creates an expiration date in seconds since UNIX epoch from now.
     * @param expirationInSeconds
     */
    static createExpirationInSeconds(expirationInSeconds: number): number;
}
