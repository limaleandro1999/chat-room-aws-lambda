import dayjs from "dayjs";
import { APIGatewayEvent } from "aws-lambda";
import { getApiGatewayManagementApiClient, getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    try {
        const dynamoDbClient = getDynamoDBClient();
        const ApiGatewayManagementApiClient = getApiGatewayManagementApiClient(`${event.requestContext.domainName}/${event.requestContext.stage}`);
        const connectionId = event.requestContext.connectionId;
        const username = (<any>event.queryStringParameters).username;
        
        await dynamoDbClient.put({
            TableName: "socket-connections",
            Item: {
                connectionId,
                username
            }
        }).promise();
    
        const response = await dynamoDbClient.scan({
            TableName: "socket-connections",
        }).promise();

        const connectionIds = response.Items?.map(({ connectionId }) => connectionId) ?? [];
        const sentDate = dayjs().format("HH:mm DD/MM/YYYY");

        for await (const connectionId of connectionIds) {
            await ApiGatewayManagementApiClient.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify({ 
                    username: "ADM",
                    message: `${username} entrou`, 
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