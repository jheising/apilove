import { KVService } from "./KVService";
export declare class DynamoDBKVStorage extends KVService {
    private static _dynamoClient;
    static readonly dynamoClient: any;
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number, done: (error?: Error) => void): void;
    hasValue(namespace: string, key: string, done: (error?: Error, hasValue?: boolean) => void): void;
    getValue(namespace: string, key: string, done: (error?: Error, value?: any) => void): void;
    deleteValue(namespace: string, key: string, done: (error?: Error) => void): void;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number, done: (error?: Error) => void): void;
}
