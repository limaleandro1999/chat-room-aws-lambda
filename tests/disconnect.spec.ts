import { handler } from '../disconnect';
import { APIGatewayEvent } from 'aws-lambda';
import { getApiGatewayManagementApiClient, getDynamoDBClient } from '../utils';

// Mock the APIGatewayEvent object
const event: APIGatewayEvent = {
  requestContext: {
    connectionId: '12345',
    domainName: 'example.com',
    stage: 'dev'
  }
} as any;

const mockPostToConnection = jest.fn().mockReturnValue({
    promise: jest.fn(),
});

const apiGatewayManagementApiClientMock = jest.fn().mockReturnValue({
    postToConnection: mockPostToConnection,
});

const mockScan = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
        Items: [
          {
            connectionId: '12345',
            username: 'testuser'
          },
          {
            connectionId: '67890',
            username: 'otheruser'
          }
        ]
    }),
});

const mockDelete = jest.fn().mockReturnValue({
    promise: jest.fn(),
});

const mockDynamoDBClient = jest.fn().mockReturnValue({
    scan: mockScan,
    delete: mockDelete,
});

// Mock the getDynamoDBClient function
jest.mock('../utils', () => ({
  getDynamoDBClient: jest.fn(() => mockDynamoDBClient()),
  getApiGatewayManagementApiClient: jest.fn(() => apiGatewayManagementApiClientMock())
}));

describe('handler', () => {
  it('should delete the connection ID from DynamoDB and send a message to other connections', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-10 09:31'));

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('');

    expect(getDynamoDBClient().delete).toHaveBeenCalledWith({
      TableName: 'socket-connections',
      Key: {
        connectionId: '12345'
      }
    });

    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '67890',
      Data: JSON.stringify({
        username: 'ADM',
        message: 'testuser saiu',
        sentDate: '09:31 10/01/2023'
      })
    });
  });

  it('should return a 500 error if there is an error deleting the connection ID from DynamoDB', async () => {
    const errorMessage = 'Error deleting connection ID from DynamoDB';
    (getDynamoDBClient().delete as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(JSON.stringify({ message: errorMessage }));
  });

  it('should return a 500 error if there is an error sending the message to other connections', async () => {
    const errorMessage = 'Error sending message to other connections';
    (mockPostToConnection as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(JSON.stringify({ message: errorMessage }));
  });
});