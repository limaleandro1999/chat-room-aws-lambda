import { APIGatewayEvent } from "aws-lambda";
import AWS from "aws-sdk";

export function getDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient({
        endpoint: process.env.IS_OFFLINE ? "http://localhost:4001" : undefined
    });
}

export function getApiGatewayManagementApiClient(event: APIGatewayEvent) {
    return new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: process.env.IS_OFFLINE ? "http://localhost:3001" : undefined
    });
}