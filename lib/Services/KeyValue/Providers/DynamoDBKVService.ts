import {KVServiceProvider, KVServiceValues, KVServiceValue} from "../KVService";
import {isNil, get} from "lodash";
import * as aws from "aws-sdk";
import {APIConfig} from "../../../APIConfig";

export class DynamoDBKVService extends KVServiceProvider {
    private static _dynamoClient;
    static get dynamoClient() {
        if (!DynamoDBKVService._dynamoClient) {
            DynamoDBKVService._dynamoClient = new aws.DynamoDB();
        }

        return DynamoDBKVService._dynamoClient;
    }

    setValue(namespace: string, key: string, value: any, expirationInSeconds: number): Promise<void> {
        value = JSON.stringify(value);

        let data: any = {
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

        if (!isNil(expirationInSeconds) && expirationInSeconds != -1) {
            data.expires.N = Math.round(Date.now() / 1000 + expirationInSeconds).toString();
        }

        return DynamoDBKVService.dynamoClient.putItem({
            Item: data,
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }).promise().then(() => Promise.resolve());
    }

    hasValue(namespace: string, key: string): Promise<boolean> {
        return this.getValue(namespace, key).then((value) => Promise.resolve(!isNil(value)));
    }

    getValue(namespace: string, key: string): Promise<any> {
        return DynamoDBKVService.dynamoClient.getItem({
            Key: {
                namespace: {
                    S: namespace
                },
                key: {
                    S: key
                }
            },
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE",
            AttributesToGet: ["value", "expires"]
        }).promise().then((data) => {
            let value = get(data, "Item.value.S");

            let expires = get(data, "Item.expires.N", -1);
            if (expires > 0) {
                let now = Math.round(Date.now() / 1000);
                if (expires <= now) {
                    value = undefined;
                }
            }

            if (!isNil(value)) {
                value = JSON.parse(value);
            }

            return Promise.resolve(value);
        });
    }

    deleteValue(namespace: string, key: string): Promise<void> {
        return DynamoDBKVService.dynamoClient.deleteItem({
            Key: {
                namespace: {
                    S: namespace
                },
                key: {
                    S: key
                }
            },
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ReturnConsumedCapacity: "NONE"
        }).promise().then(() => Promise.resolve());
    }

    updateExpiration(namespace: string, key: string, expirationInSeconds: number): Promise<void> {
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
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            UpdateExpression: "SET #AT = :t"
        }).promise().then(() => Promise.resolve());
    }

    async getValues(namespace: string, page: number, pageSize: number): Promise<KVServiceValues> {

        // Get our total count first
        let totalCount = (await DynamoDBKVService.dynamoClient.query({
            TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
            ExpressionAttributeValues: {
                ":v1": {
                    S: namespace
                }
            },
            KeyConditionExpression: `namespace = :v1`,
            Select: "COUNT"
        }).promise()).Count;

        let totalPages = Math.ceil(totalCount / pageSize);

        let values: KVServiceValue[] = [];

        if (page > 0 && page <= totalPages) {

            let currentPage = 1;

            async function doQuery(lastEvaluatedKey?: any) {

                let queryOptions: any = {
                    TableName: APIConfig.DYNAMO_KV_STORAGE_TABLE_NAME,
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

                let results = await DynamoDBKVService.dynamoClient.query(queryOptions).promise();

                ++currentPage;

                if (currentPage <= page && !isNil(results.LastEvaluatedKey)) {
                    await doQuery(results.LastEvaluatedKey);
                } else {
                    for (let item of results.Items) {
                        let value = get(item, "value.S");

                        let expires = get(item, "expires.N", -1);
                        if (expires > 0) {
                            let now = Math.round(Date.now() / 1000);
                            if (expires <= now) {
                                continue;
                            }
                        }

                        if (!isNil(value)) {
                            value = JSON.parse(value);
                        }

                        values.push({
                            key: get(item, "key.S"),
                            value: value
                        });
                    }
                }
            }

            await doQuery();
        }

        return {
            values: values,
            totalCount: totalCount,
            totalPages: totalPages,
            page: page
        };
    }
}