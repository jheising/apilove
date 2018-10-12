import {APIConfig} from "../../APIConfig";
import {isNil} from "lodash";
import {APIUtils} from "../../APIUtils";

export abstract class KVServiceProvider {
    abstract setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void>;

    abstract getValue(namespace: string, key: string): Promise<any>;

    abstract deleteValue(namespace: string, key: string): Promise<void>;

    abstract hasValue(namespace: string, key: string): Promise<boolean>;

    abstract updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void>;
}

export class KVService {

    private static _providerInstance: KVServiceProvider;

    private static get _provider(): KVServiceProvider {
        if (!KVService._providerInstance) {
            let providerClass = require(`./Providers/${APIConfig.KV_STORAGE_SERVICE_PROVIDER}`)[APIConfig.KV_STORAGE_SERVICE_PROVIDER];
            KVService._providerInstance = new providerClass();
        }
        return KVService._providerInstance;
    }

    static setValue(namespace: string, key: string, value: any, expirationInSeconds?: number, encrypted: boolean = APIConfig.ENCRYPT_KV_DATA): Promise<void> {

        if (encrypted) {
            value = APIUtils.encrypt(JSON.stringify(value));
        }

        return KVService._provider.setValue(namespace, key, value, expirationInSeconds);
    }

    static getValue(namespace: string, key: string, defaultValue?: any, encrypted: boolean = APIConfig.ENCRYPT_KV_DATA): Promise<any> {
        return KVService._provider.getValue(namespace, key).then((value) => {

            if (isNil(value)) {
                return defaultValue;
            }

            if (encrypted) {
                value = JSON.parse(APIUtils.decrypt(value));
            }

            return value;
        });
    }

    static deleteValue(namespace: string, key: string): Promise<void> {
        return KVService._provider.deleteValue(namespace, key);
    }

    static hasValue(namespace: string, key: string): Promise<boolean> {
        return KVService._provider.hasValue(namespace, key);
    }

    static updateExpiration(namespace: string, key: string, expirationInSeconds?: number): Promise<void> {
        return KVService._provider.updateExpiration(namespace, key, expirationInSeconds);
    }
}