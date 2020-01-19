import { KVServiceProvider, KVServiceValues } from "../KVService";
export declare class DynamoDBKVService extends KVServiceProvider {
    private static _dynamoClient;
    static get dynamoClient(): any;
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;
    hasValue(namespace: string, key: string): Promise<boolean>;
    getValue(namespace: string, key: string): Promise<any>;
    deleteValue(namespace: string, key: string): Promise<void>;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
    getValues(namespace: string, page: number, pageSize: number): Promise<KVServiceValues>;
}
