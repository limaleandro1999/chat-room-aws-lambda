import dayjs from "dayjs";
import { APIGatewayEvent } from "aws-lambda";
import { getApiGatewayManagementApiClient, getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    try {
        const dynamoDbClient = getDynamoDBClient();
        const ApiGatewayManagementApiClient = getApiGatewayManagementApiClient(`${event.requestContext.domainName}/${event.requestContext.stage}`);
        const connectionId = event.requestContext.connectionId;
        
        const response = await dynamoDbClient.scan({
            TableName: "socket-connections",
        }).promise();

        await dynamoDbClient.delete({
            TableName: "socket-connections",
            Key: {
                connectionId
            }
        }).promise();

        const deletedConnectionUsername = response.Items
            ?.filter((item) => item.connectionId === connectionId)
            .map(item => item.username)
            .join("");
        const connectionIds = response.Items
            ?.filter((item) => item.connectionId !== connectionId )
            .map(({ connectionId }) => connectionId) ?? [];

        const sentDate = dayjs().format("HH:mm DD/MM/YYYY");

        for await (const connectionId of connectionIds) {
            await ApiGatewayManagementApiClient.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({ 
                    username: "ADM",
                    message: `${deletedConnectionUsername} saiu`, 
                    sentDate 
                })
            }).promise();
        }
    
        return { statusCode: 200, body: "" };   
    } catch (error: any) {
        return { 
            statusCode: 500,
            body: JSON.stringify({ message: error.message }) 
        };
    }
}