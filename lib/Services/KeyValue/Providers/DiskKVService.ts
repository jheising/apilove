import {isNil} from "lodash";
import {KVServiceProvider} from "../KVService";
import {DiskFileService} from "../../File/Providers/DiskFileService";
import {APIConfig} from "../../../APIConfig";
import {APIUtils} from "../../../APIUtils";


export class DiskKVService extends KVServiceProvider {
    private static _fileServiceInstance: DiskFileService

    private static get _fileService(): DiskFileService {
        let service = DiskKVService._fileServiceInstance;

        if (isNil(service)) {
            service = new DiskFileService(APIConfig.DISK_KV_STORAGE_ROOT_PATH);
            DiskKVService._fileServiceInstance = service;
        }

        return service;
    }

    setValue(namespace: string, key: string, value: any, expirationInSeconds: number):Promise<void> {

        let data = {
            value: value,
            expires: isNil(expirationInSeconds) ? undefined : Date.now() + expirationInSeconds * 1000,
        };

        return DiskKVService._fileService.writeFile(`${APIUtils.slugify(namespace)}/${APIUtils.slugify(key)}.json`, JSON.stringify(data));
    }

    hasValue(namespace: string, key: string):Promise<boolean> {
        return DiskKVService._fileService.pathExists(`${APIUtils.slugify(namespace)}/${APIUtils.slugify(key)}.json`);
    }

    private _getValue(namespace: string, key: string):Promise<{value:any, expires:number}> {
        return DiskKVService._fileService.readFile(`${APIUtils.slugify(namespace)}/${APIUtils.slugify(key)}.json`).then((fileContents) => {
            let data = JSON.parse(fileContents);
            return Promise.resolve(data);
        }).catch(() => {
            return;
        });
    }

    getValue(namespace: string, key: string):Promise<any> {
        return this._getValue(namespace, key).then((data) => {

            if(isNil(data))
            {
                return Promise.resolve();
            }

            if(data.expires && data.expires <= Date.now())
            {
                return this.deleteValue(namespace, key).then(() => Promise.resolve(data.value));
            }

            return Promise.resolve(data.value);
        });
    }

    deleteValue(namespace: string, key: string):Promise<void> {
        return DiskKVService._fileService.deleteFile(`${APIUtils.slugify(namespace)}/${APIUtils.slugify(key)}.json`);
    }

    updateExpiration(namespace: string, key: string, expirationInSeconds: number):Promise<void> {
        return this._getValue(namespace, key).then((data) => {

            if(isNil(data))
            {
                return Promise.resolve();
            }

            return this.setValue(namespace, key, data.value, expirationInSeconds);
        });
    }
}