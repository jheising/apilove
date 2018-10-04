import {isNil} from "lodash";
import {KVService} from "./KVService";

export class MemoryKVService extends KVService
{
    private _data = {};

    setValue(namespace:string, key:string, value:any, expirationInSeconds:number, done:(error?:Error) => void)
    {
        this._data[namespace + key] = {
            expires: isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
            value: value
        };

        if(done) done(null);
    }

    hasValue(namespace:string, key:string, done:(error?:Error, hasValue?:boolean) => void)
    {
        if(done)
        {
            done(null, (namespace + key) in this._data);
        }
    }

    getValue(namespace:string, key:string, done:(error?:Error, value?:any) => void)
    {
        let data = this._data[namespace + key];

        if(isNil(data) || (data.expires && data.expires <= Date.now()))
        {
            if(done) done();
            return;
        }

        if(done) done(null, data.value);
    }

    deleteValue(namespace:string, key:string, done:(error?:Error) => void)
    {
        delete this._data[namespace + key];
        if(done) done();
    }

    updateExpiration(namespace:string, key:string, expirationInSeconds:number, done:(error?:Error) => void)
    {
        let data = this._data[namespace + key];

        if(!isNil(data))
        {
            data.expiration = isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000;
        }

        if(done) done();
    }
}