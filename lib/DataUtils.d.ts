export declare class DataUtils {
    private static _IV_LENGTH;
    private static _CRYPTO_ALG;
    private static _HASH_ALG;
    static encrypt(text: string, password?: string): string;
    static decrypt(text: string, password?: string): string;
    static hashString(string: string): string;
    static hashMD5(string: string): string;
}
