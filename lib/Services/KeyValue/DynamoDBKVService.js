"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KVService_1 = require("./KVService");
const lodash_1 = require("lodash");
const aws = require("aws-sdk");
const APIConfig_1 = require("../../APIConfig");
class DynamoDBKVStorage extends KVService_1.KVService {
    static get dynamoClient() {
        if (!DynamoDBKVStorage._dynamoClient) {
            DynamoDBKVStorage._dynamoClient = new aws.DynamoDB();
        }
        return DynamoDBKVStorage._dynamoClient;
    }
    setValue(namespace, key, value, expirationInSeconds, done) {
        value = JSON.stringify(value);
        let data = {
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
        if (!lodash_1.isNil(expirationInSeconds) && expirationInSeconds != -1) {
            data.expires.N = Math.round(Date.now() / 1000 + expirationInSeconds).toString();
        }
        DynamoDBKVStorage.dynamoClient.putItem({
            Item: data,
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }, (error, data) => {
            if (done) {
                done(error);
            }
        });
    }
    hasValue(namespace, key, done) {
        this.getValue(namespace, key, (error, value) => {
            if (done) {
                done(error, !lodash_1.isNil(value));
            }
        });
    }
    getValue(namespace, key, done) {
        DynamoDBKVStorage.dynamoClient.getItem({
            Key: {
                key: {
                    S: `${namespace}:${key}`
                }
            },
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE",
            AttributesToGet: ["value", "expires"]
        }, (error, data) => {
            let value = lodash_1.get(data, "Item.value.S");
            let expires = lodash_1.get(data, "Item.expires.N", -1);
            if (expires > 0) {
                let now = Math.round(Date.now() / 1000);
                if (expires <= now) {
                    value = undefined;
                }
            }
            if (!lodash_1.isNil(value)) {
                value = JSON.parse(value);
            }
            if (done) {
                done(null, value);
            }
        });
    }
    deleteValue(namespace, key, done) {
        DynamoDBKVStorage.dynamoClient.deleteItem({
            Key: {
                key: {
                    S: `${namespace}:${key}`
                }
            },
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }, (error, data) => {
            if (done) {
                done(error);
            }
        });
    }
    updateExpiration(namespace, key, expirationInSeconds, done) {
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
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            UpdateExpression: "SET #AT = :t"
        }, (error, data) => {
            if (done) {
                done(error);
            }
        });
    }
}
exports.DynamoDBKVStorage = DynamoDBKVStorage;
//# sourceMappingURL=DynamoDBKVService.js.map