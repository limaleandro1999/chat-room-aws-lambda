import { APIGatewayEvent } from "aws-lambda";
import { getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    const dynamoDbClient = getDynamoDBClient();
    const connectionId = event.requestContext.connectionId
    
    await dynamoDbClient.delete({
        TableName: "socket-connections",
        Key: {
            connectionId
        }
    }).promise();

    return;
}