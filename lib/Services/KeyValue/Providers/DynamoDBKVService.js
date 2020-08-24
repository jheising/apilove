"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBKVService = void 0;
const KVService_1 = require("../KVService");
const lodash_1 = require("lodash");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const APIConfig_1 = require("../../../APIConfig");
class DynamoDBKVService extends KVService_1.KVServiceProvider {
    static get dynamoClient() {
        if (!DynamoDBKVService._dynamoClient) {
            DynamoDBKVService._dynamoClient = new aws_sdk_1.default.DynamoDB();
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
    getValues(namespace, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get our total count first
            let totalCount = (yield DynamoDBKVService.dynamoClient.query({
                TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
                ExpressionAttributeValues: {
                    ":v1": {
                        S: namespace
                    }
                },
                KeyConditionExpression: `namespace = :v1`,
                Select: "COUNT"
            }).promise()).Count;
            let totalPages = Math.ceil(totalCount / pageSize);
            let values = [];
            if (page > 0 && page <= totalPages) {
                let currentPage = 1;
                function doQuery(lastEvaluatedKey) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let queryOptions = {
                            TableName: APIConfig_1.APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
                            ExpressionAttributeValues: {
                                ":v1": {
                                    S: namespace
                                }
                            },
                            KeyConditionExpression: `namespace = :v1`,
                            Select: currentPage === page ? "ALL_ATTRIBUTES" : "COUNT",
                            Limit: pageSize
                        };
                        if (lastEvaluatedKey) {
                            queryOptions.ExclusiveStartKey = lastEvaluatedKey;
                        }
                        let results = yield DynamoDBKVService.dynamoClient.query(queryOptions).promise();
                        ++currentPage;
                        if (currentPage <= page && !lodash_1.isNil(results.LastEvaluatedKey)) {
                            yield doQuery(results.LastEvaluatedKey);
                        }
                        else {
                            for (let item of results.Items) {
                                let value = lodash_1.get(item, "value.S");
                                let expires = lodash_1.get(item, "expires.N", -1);
                                if (expires > 0) {
                                    let now = Math.round(Date.now() / 1000);
                                    if (expires <= now) {
                                        continue;
                                    }
                                }
                                if (!lodash_1.isNil(value)) {
                                    value = JSON.parse(value);
                                }
                                values.push({
                                    key: lodash_1.get(item, "key.S"),
                                    value: value
                                });
                            }
                        }
                    });
                }
                yield doQuery();
            }
            return {
                values: values,
                totalCount: totalCount,
                totalPages: totalPages,
                page: page
            };
        });
    }
}
exports.DynamoDBKVService = DynamoDBKVService;
//# sourceMappingURL=DynamoDBKVService.js.map