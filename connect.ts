import { APIGatewayEvent } from "aws-lambda";
import { getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    const dynamoDbClient = getDynamoDBClient();
    const connectionId = event.requestContext.connectionId
    
    await dynamoDbClient.put({
        TableName: "socket-connections",
        Item: {
            connectionId,
        }
    }).promise();

    return;
}