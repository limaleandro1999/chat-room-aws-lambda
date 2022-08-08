import { APIGatewayEvent } from "aws-lambda";
import dayjs from "dayjs";
import { getApiGatewayManagementApiClient, getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    const dynamoDbClient = getDynamoDBClient();
    const ApiGatewayManagementApiClient = getApiGatewayManagementApiClient(event);

    const response = await dynamoDbClient.scan({
        TableName: "socket-connections",
    }).promise();

    const connectionIds = response.Items?.map(({ connectionId }) => connectionId) ?? [];
    const body = event.body ? JSON.parse(event.body) : {};

    for await (const connectionId of connectionIds) {
        await ApiGatewayManagementApiClient.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({ ...body, sentDate: dayjs().format("HH:mm DD/MM/YYYY") })
        }).promise();
    }

    return {};
}