import AWS from "aws-sdk";

export function getDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient({
        endpoint: process.env.IS_OFFLINE ? "http://localhost:4001" : undefined
    });
}

export function getApiGatewayManagementApiClient(endpoint: string) {
    return new AWS.ApiGatewayManagementApi({
        endpoint: process.env.IS_OFFLINE ? "http://localhost:3001" : endpoint,
    });
}
