import { KVServiceProvider, KVServiceValues } from "../KVService";
export declare class DiskKVService extends KVServiceProvider {
    private static _fileServiceInstance;
    private static get _fileService();
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;
    hasValue(namespace: string, key: string): Promise<boolean>;
    private _getValue;
    getValue(namespace: string, key: string): Promise<any>;
    deleteValue(namespace: string, key: string): Promise<void>;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
    getValues(namespace: string, page: number, pageSize: number): Promise<KVServiceValues>;
}
