import { KVServiceProvider } from "../KVService";
export declare class MemoryKVService extends KVServiceProvider {
    private _data;
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;
    hasValue(namespace: string, key: string): Promise<boolean>;
    getValue(namespace: string, key: string): Promise<any>;
    deleteValue(namespace: string, key: string): Promise<void>;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
}
