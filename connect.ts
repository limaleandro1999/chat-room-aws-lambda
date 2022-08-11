import { APIGatewayEvent } from "aws-lambda";
import { getDynamoDBClient } from "./utils";

export async function handler(event: APIGatewayEvent) {
    try {
        const dynamoDbClient = getDynamoDBClient();
        const connectionId = event.requestContext.connectionId;
        const username = (<any>event.queryStringParameters).username;

        await dynamoDbClient.put({
            TableName: "socket-connections",
            Item: {
                connectionId,
                username
            }
        }).promise();
    
        return { statusCode: 200, body: "" };
    } catch (error: any) {
        console.log(error);

        return { 
            statusCode: 500,
            body: JSON.stringify({ message: error.message }) 
        };
    }    
}