import { handler } from '../on-message';
import { APIGatewayEvent } from 'aws-lambda';

// Mock the APIGatewayEvent object
const event: APIGatewayEvent = {
  requestContext: {
    connectionId: '12345',
    domainName: 'example.com',
    stage: 'dev'
  },
  body: JSON.stringify({
    message: 'Test message'
  })
} as any;

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

const mockPostToConnection = jest.fn().mockReturnValue({
    promise: jest.fn(),
});

const apiGatewayManagementApiClientMock = jest.fn().mockReturnValue({
    postToConnection: mockPostToConnection,
});

const mockDynamoDBClient = jest.fn().mockReturnValue({
    scan: mockScan,
});

// Mock the getDynamoDBClient function
jest.mock('../utils', () => ({
    getDynamoDBClient: jest.fn(() => mockDynamoDBClient()),
    getApiGatewayManagementApiClient: jest.fn(() => apiGatewayManagementApiClientMock())
}));

describe('handler', () => {
  it('should send the message to all connections and return a 200 status code', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-10 09:31'));

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe('');

    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '12345',
      Data: JSON.stringify({
        message: 'Test message',
        sentDate: '09:31 10/01/2023'
      })
    });

    expect(mockPostToConnection).toHaveBeenCalledWith({
      ConnectionId: '67890',
      Data: JSON.stringify({
        message: 'Test message',
        sentDate: '09:31 10/01/2023'
      })
    });
  });

  it('should return a 500 error if there is an error scanning the DynamoDB table', async () => {
    const errorMessage = 'Error scanning DynamoDB table';
    (mockScan).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(JSON.stringify({ message: errorMessage }));
  });

  it('should return a 500 error if there is an error sending the message to a connection', async () => {
    const errorMessage = 'Error sending message to connection';
    (mockPostToConnection).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(JSON.stringify({ message: errorMessage }));
  });
});