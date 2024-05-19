import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB, SageMakerRuntime } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const db = new DynamoDB.DocumentClient();
const runtime = new SageMakerRuntime();

const sagemakerEndpoint = 'https://your-sagemaker-endpoint.amazonaws.com';

export const handler: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message;

    const chatId = uuidv4();
    const timestamp = new Date().toISOString();

    // Save user message to DynamoDB
    const userMessageParams = {
        TableName: process.env.TABLE_NAME || '',
        Item: {
            chatId,
            timestamp,
            role: 'user',
            message: userMessage
        }
    };

    try {
        await db.put(userMessageParams).promise();
    } catch (error) {
        console.error('Error saving user message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error saving user message'
            })
        };
    }

    // Invoke SageMaker Endpoint
    const params = {
        EndpointName: sagemakerEndpoint,
        Body: JSON.stringify({ input: userMessage }),
        ContentType: 'application/json'
    };

    let botResponse;
    try {
        const response = await runtime.invokeEndpoint(params).promise();
        const responseBody = JSON.parse(response.Body as string);
        botResponse = responseBody.output;
    } catch (error) {
        console.error('Error invoking SageMaker endpoint:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error invoking SageMaker endpoint'
            })
        };
    }

    // Save bot response to DynamoDB
    const botMessageParams = {
        TableName: process.env.TABLE_NAME || '',
        Item: {
            chatId,
            timestamp: new Date().toISOString(),
            role: 'bot',
            message: botResponse
        }
    };

    try {
        await db.put(botMessageParams).promise();
    } catch (error) {
        console.error('Error saving bot message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error saving bot message'
            })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: botResponse
        })
    };
};
