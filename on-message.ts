import dayjs from "dayjs";
import { APIGatewayEvent } from "aws-lambda";
import { getApiGatewayManagementApiClient, getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    try {
        const dynamoDbClient = getDynamoDBClient();
        const ApiGatewayManagementApiClient = getApiGatewayManagementApiClient(`${event.requestContext.domainName}/${event.requestContext.stage}`);

        const response = await dynamoDbClient.scan({
            TableName: "socket-connections",
        }).promise();

        const connectionIds = response.Items?.map(({ connectionId }) => connectionId) ?? [];
        const body = event.body ? JSON.parse(event.body) : {};
        const sentDate = dayjs().format("HH:mm DD/MM/YYYY");

        for await (const connectionId of connectionIds) {
            await ApiGatewayManagementApiClient.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({ 
                    ...body, 
                    sentDate 
                })
            }).promise();
        }

        return { statusCode: 200, body: "" };
    } catch (error: any) {
        console.log(error)
        return { 
            statusCode: 500,
            body: JSON.stringify({ message: error.message }) 
        };
    }
}