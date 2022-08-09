import { APIGatewayEvent } from "aws-lambda";
import { getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    try {
        const dynamoDbClient = getDynamoDBClient();
        const connectionId = event.requestContext.connectionId
        
        await dynamoDbClient.put({
            TableName: "socket-connections",
            Item: {
                connectionId,
            }
        }).promise();
    
        return { statusCode: 200, body: "" };
    } catch (error: any) {
        return { 
            statusCode: 500,
            body: JSON.stringify({ message: error.message }) 
        };
    }    
}