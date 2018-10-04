export declare abstract class KVService {
    private static _instance;
    static readonly instance: KVService;
    abstract setValue(namespace: string, key: string, value: any, expirationInSeconds: number, done: (error?: Error) => void): any;
    abstract getValue(namespace: string, key: string, done: (error?: Error, value?: any) => void): any;
    abstract deleteValue(namespace: string, key: string, done: (error?: Error) => void): any;
    abstract hasValue(namespace: string, key: string, done: (error?: Error, hasValue?: boolean) => void): any;
    abstract updateExpiration(namespace: string, key: string, expirationInSeconds: number, done: (error?: Error) => void): any;
}
