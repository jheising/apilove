import { KVServiceProvider } from "../KVService";
export declare class DynamoDBKVStorage extends KVServiceProvider {
    private static _dynamoClient;
    static readonly dynamoClient: any;
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;
    hasValue(namespace: string, key: string): Promise<boolean>;
    getValue(namespace: string, key: string): Promise<any>;
    deleteValue(namespace: string, key: string): Promise<void>;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
}