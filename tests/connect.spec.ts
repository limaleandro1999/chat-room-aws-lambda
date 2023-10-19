import { getDynamoDBClient } from '../utils';
import { handler } from '../connect';
import { APIGatewayEvent } from 'aws-lambda';

// Mock the APIGatewayEvent object
const event: APIGatewayEvent = {
  requestContext: {
    connectionId: '12345'
  },
  queryStringParameters: {
    username: 'testuser'
  }
} as any;

const mockPut = jest.fn().mockReturnValue({
    promise: jest.fn(),
});

const mockDynamoDBClient = jest.fn().mockReturnValue({
    put: mockPut,
});


// Mock the getDynamoDBClient function
jest.mock('../utils', () => ({
  getDynamoDBClient: jest.fn(() => mockDynamoDBClient())
}));

describe('handler', () => {
  it('should put the connection ID and username in DynamoDB', async () => {
    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('');

    expect(mockPut).toHaveBeenCalledWith({
      TableName: 'socket-connections',
      Item: {
        connectionId: '12345',
        username: 'testuser'
      }
    });
  });

  it('should return a 500 error if there is an error putting the data in DynamoDB', async () => {
    const errorMessage = 'Error putting data in DynamoDB';
    (getDynamoDBClient().put as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(JSON.stringify({ message: errorMessage }));
  });
});