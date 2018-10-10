export declare abstract class KVServiceProvider {
    abstract setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;
    abstract getValue(namespace: string, key: string): Promise<any>;
    abstract deleteValue(namespace: string, key: string): Promise<void>;
    abstract hasValue(namespace: string, key: string): Promise<boolean>;
    abstract updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
}
export declare class KVService {
    private static _providerInstance;
    private static readonly _provider;
    static setValue(namespace: string, key: string, value: any, expirationInSeconds: number, encrypted?: boolean): Promise<void>;
    static getValue(namespace: string, key: string, defaultValue?: any, encrypted?: boolean): Promise<any>;
    static deleteValue(namespace: string, key: string): Promise<void>;
    static hasValue(namespace: string, key: string): Promise<boolean>;
    static updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
}
