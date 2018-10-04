import { KVService } from "./KVService";
export declare class MemoryKVService extends KVService {
    private _data;
    setValue(namespace: string, key: string, value: any, expirationInSeconds: number, done: (error?: Error) => void): void;
    hasValue(namespace: string, key: string, done: (error?: Error, hasValue?: boolean) => void): void;
    getValue(namespace: string, key: string, done: (error?: Error, value?: any) => void): void;
    deleteValue(namespace: string, key: string, done: (error?: Error) => void): void;
    updateExpiration(namespace: string, key: string, expirationInSeconds: number, done: (error?: Error) => void): void;
}
