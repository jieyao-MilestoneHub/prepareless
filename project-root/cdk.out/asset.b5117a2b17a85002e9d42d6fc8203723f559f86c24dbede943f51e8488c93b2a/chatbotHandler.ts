import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB, SageMakerRuntime } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const db = new DynamoDB.DocumentClient();
const runtime = new SageMakerRuntime();

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

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
        console.log('Saved user message to DynamoDB:', userMessageParams);
    } catch (error) {
        console.error('Error saving user message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error saving user message'
            })
        };
    }

    // Invoke Bedrock API
    const params = {
        EndpointName: process.env.SAGEMAKER_ENDPOINT || '',
        Body: JSON.stringify({ input: userMessage }),
        ContentType: 'application/json'
    };

    let botResponse;
    try {
        const response = await runtime.invokeEndpoint(params).promise();
        const responseBody = JSON.parse(response.Body as string);
        botResponse = responseBody.output;
        console.log('Received response from Bedrock API:', botResponse);
    } catch (error) {
        console.error('Error invoking Bedrock endpoint:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error invoking Bedrock endpoint'
            })
        };
    }

    // Implement RAG logic here (e.g., retrieve relevant documents, augment the response)

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
        console.log('Saved bot message to DynamoDB:', botMessageParams);
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
