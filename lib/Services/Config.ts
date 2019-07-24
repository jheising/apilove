import {isNil} from "lodash";
import {APIUtils} from "../APIUtils";
import "reflect-metadata";

export function EnvVarSync(target: any, key: string)
{
    let envVar = process.env[key];

    // If we have an environment var defined, use it
    if(!isNil(envVar))
    {
        let metadata = Reflect.getMetadata("design:type", target, key);
        let paramType = metadata.title;

        try
        {
            target[key] = APIUtils.convertToType(envVar, paramType);
        }
        catch (e) {
            console.error(`Unable to parse environment variable named ${key}`);
        }
    }
    // If we don't have an env var defined, assign the value of this to it
    else
    {
        process.env[key] = target[key];
    }
}