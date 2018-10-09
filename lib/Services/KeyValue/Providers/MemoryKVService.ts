import {isNil} from "lodash";
import {KVServiceProvider} from "../KVService";

export class MemoryKVService extends KVServiceProvider {
    private _data = {};

    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void> {
        this._data[namespace + key] = {
            expires: isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        };

        return Promise.resolve();
    }

    hasValue(namespace: string, key: string): Promise<boolean> {
        return Promise.resolve((namespace + key) in this._data);
    }

    getValue(namespace: string, key: string): Promise<any> {
        let data = this._data[namespace + key];

        if (isNil(data) || (data.expires && data.expires <= Date.now())) {
            return Promise.resolve();
        }

        return Promise.resolve(data.value);
    }

    deleteValue(namespace: string, key: string):Promise<void> {
        delete this._data[namespace + key];
        return Promise.resolve();
    }

    updateExpiration(namespace: string, key: string, expirationInSeconds: number):Promise<void> {
        let data = this._data[namespace + key];

        if (!isNil(data)) {
            data.expiration = isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }

        return Promise.resolve();
    }
}