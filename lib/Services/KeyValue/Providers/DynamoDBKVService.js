"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KVService_1 = require("../KVService");
const lodash_1 = require("lodash");
const aws = require("aws-sdk");
const APIConfig_1 = require("../../../APIConfig");
class DynamoDBKVService extends KVService_1.KVServiceProvider {
    static get dynamoClient() {
        if (!DynamoDBKVService._dynamoClient) {
            DynamoDBKVService._dynamoClient = new aws.DynamoDB();
        }
        return DynamoDBKVService._dynamoClient;
    }
    setValue(namespace, key, value, expirationInSeconds) {
        value = JSON.stringify(value);
        let data = {
            namespace: {
                S: namespace
            },
            key: {
                S: key
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
        return DynamoDBKVService.dynamoClient.putItem({
            Item: data,
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }).promise().then(() => Promise.resolve());
    }
    hasValue(namespace, key) {
        return this.getValue(namespace, key).then((value) => Promise.resolve(!lodash_1.isNil(value)));
    }
    getValue(namespace, key) {
        return DynamoDBKVService.dynamoClient.getItem({
            Key: {
                namespace: {
                    S: namespace
                },
                key: {
                    S: key
                }
            },
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE",
            AttributesToGet: ["value", "expires"]
        }).promise().then((data) => {
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
            return Promise.resolve(value);
        });
    }
    deleteValue(namespace, key) {
        return DynamoDBKVService.dynamoClient.deleteItem({
            Key: {
                namespace: {
                    S: namespace
                },
                key: {
                    S: key
                }
            },
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }).promise().then(() => Promise.resolve());
    }
    updateExpiration(namespace, key, expirationInSeconds) {
        return DynamoDBKVService.dynamoClient.updateItem({
            ExpressionAttributeNames: {
                "#AT": "expires"
            },
            ExpressionAttributeValues: {
                ":t": {
                    N: Math.round(Date.now() / 1000 + expirationInSeconds).toString()
                }
            },
            Key: {
                namespace: {
                    S: namespace
                },
                key: {
                    S: key
                }
            },
            ReturnValues: "NONE",
            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            UpdateExpression: "SET #AT = :t"
        }).promise().then(() => Promise.resolve());
    }
}
exports.DynamoDBKVService = DynamoDBKVService;
//# sourceMappingURL=DynamoDBKVService.js.map