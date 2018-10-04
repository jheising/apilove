import {APIConfig} from "../../APIConfig";

export abstract class KVService {
    private static _instance:KVService;
    static get instance():KVService
    {
        if(!KVService._instance) {
            let kvProviderClass = require(`./${APIConfig.KV_STORAGE_SERVICE_PROVIDER}`)[APIConfig.KV_STORAGE_SERVICE_PROVIDER];
            KVService._instance = new kvProviderClass();
        }

        return KVService._instance;
    }

    abstract setValue(namespace:string, key:string, value:any, expirationInSeconds:number, done:(error?:Error) => void);
    abstract getValue(namespace:string, key:string, done:(error?:Error, value?:any) => void);
    abstract deleteValue(namespace:string, key:string, done:(error?:Error) => void);
    abstract hasValue(namespace:string, key:string, done:(error?:Error, hasValue?:boolean) => void);
    abstract updateExpiration(namespace:string, key:string, expirationInSeconds:number, done:(error?:Error) => void);
}