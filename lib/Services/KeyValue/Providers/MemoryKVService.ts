import {isNil, set, has, get, unset, map} from "lodash";
import {KVServiceProvider, KVServiceValues, KVServiceValue} from "../KVService";

interface MemoryKVServiceValue {
    expires: number;
    value: any;
}

export class MemoryKVService extends KVServiceProvider {
    private _data = {};

    private _isExpired(value:MemoryKVServiceValue)
    {
        return (value.expires > 0 && value.expires <= Date.now());
    }

    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void> {

        set(this._data, [namespace, key], {
            expires: isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        } as MemoryKVServiceValue);

        return Promise.resolve();
    }

    hasValue(namespace: string, key: string): Promise<boolean> {
        return Promise.resolve(has(this._data, [namespace, key]));
    }

    getValue(namespace: string, key: string): Promise<any> {
        let data = get(this._data, [namespace, key]);

        if (this._isExpired(data)) {
            unset(this._data, [namespace, key]);
            return Promise.resolve();
        }

        return Promise.resolve(data.value);
    }

    deleteValue(namespace: string, key: string):Promise<void> {
        unset(this._data, [namespace, key]);
        return Promise.resolve();
    }

    updateExpiration(namespace: string, key: string, expirationInSeconds: number):Promise<void> {
        let data = get(this._data, [namespace, key]);

        if (!isNil(data)) {
            data.expiration = isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }

        return Promise.resolve();
    }

    getValues(namespace: string, page: number, pageSize: number): Promise<KVServiceValues> {
        return Promise.reject("Not implemented");
    }
}