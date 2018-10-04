import {KVService} from "./KVService";
import {isNil, get} from "lodash";
import * as aws from "aws-sdk";
import {APIConfig} from "../../APIConfig";

export class DynamoDBKVStorage extends KVService
{
    private static _dynamoClient;
    static get dynamoClient() {
        if (!DynamoDBKVStorage._dynamoClient) {
            DynamoDBKVStorage._dynamoClient = new aws.DynamoDB();
        }

        return DynamoDBKVStorage._dynamoClient;
    }

    setValue(namespace:string, key:string, value:any, expirationInSeconds:number, done:(error?:Error) => void)
    {
        value = JSON.stringify(value);

        let data: any = {
            key: {
                S: `${namespace}:${key}`
            },
            value: {
                S: value
            },
            expires: {
                N: "-1"
            }
        };

        if (!isNil(expirationInSeconds) && expirationInSeconds != -1) {
            data.expires.N = Math.round(Date.now() / 1000 + expirationInSeconds).toString();
        }

        DynamoDBKVStorage.dynamoClient.putItem({
            Item: data,
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }, (error, data) => {
            if(done)
            {
                done(error);
            }
        });
    }

    hasValue(namespace:string, key:string, done:(error?:Error, hasValue?:boolean) => void)
    {
        this.getValue(namespace, key, (error, value) => {
            if(done)
            {
                done(error, !isNil(value));
            }
        });
    }

    getValue(namespace:string, key:string, done:(error?:Error, value?:any) => void)
    {
        DynamoDBKVStorage.dynamoClient.getItem({
            Key: {
                key: {
                    S: `${namespace}:${key}`
                }
            },
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE",
            AttributesToGet: ["value", "expires"]
        }, (error, data) => {
            let value = get(data, "Item.value.S");

            let expires = get(data, "Item.expires.N", -1);
            if(expires > 0)
            {
                let now = Math.round(Date.now() / 1000);
                if(expires <= now)
                {
                    value = undefined;
                }
            }

            if(!isNil(value))
            {
                value = JSON.parse(value);
            }

            if(done)
            {
                done(null, value);
            }
        });
    }

    deleteValue(namespace:string, key:string, done:(error?:Error) => void)
    {
        DynamoDBKVStorage.dynamoClient.deleteItem({
            Key: {
                key: {
                    S: `${namespace}:${key}`
                }
            },
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }, (error, data) => {
            if(done)
            {
                done(error);
            }
        });
    }

    updateExpiration(namespace:string, key:string, expirationInSeconds:number, done:(error?:Error) => void)
    {
        DynamoDBKVStorage.dynamoClient.updateItem({
            ExpressionAttributeNames: {
                "#AT": "expires"
            },
            ExpressionAttributeValues: {
                ":t": {
                    N: Math.round(Date.now() / 1000 + expirationInSeconds).toString()
                }
            },
            Key: {
                key: {
                    S: `${namespace}:${key}`
                }
            },
            ReturnValues: "NONE",
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            UpdateExpression: "SET #AT = :t"
        }, (error, data) => {
            if(done)
            {
                done(error);
            }
        });
    }
}