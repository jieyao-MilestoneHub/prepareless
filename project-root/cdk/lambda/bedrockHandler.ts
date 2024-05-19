import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// 硬编码的 Bedrock API URL 和 API 密钥
const bedrockEndpoint = 'https://uo9fqdi9rl.execute-api.us-west-2.amazonaws.com/prod/bedrock';
const apiKey = 'H6M6hhpAO733XaFLYfwpl7YEd5cSloFR2LwTH966';

// 獲取環境變數
const region = process.env.REGION || 'us-west-2'; // 默認值 us-west-2
const tableName = process.env.TABLE_NAME || '';

if (!region || !tableName) {
    throw new Error('Missing required environment variables');
}

const db = new DynamoDB.DocumentClient({ region });

const invokeClaude3Sonnet = async (userMessage: string) => {
    const payload = {
        model: 'claude-3-sonnet',
        input: userMessage
    };

    try {
        const response = await axios.post(bedrockEndpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.data.output;
    } catch (error) {
        console.error('Error invoking Bedrock endpoint:', error);
        throw new Error('Error invoking Bedrock endpoint');
    }
};

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message;

    const chatId = uuidv4();
    const timestamp = new Date().toISOString();

    const userMessageParams = {
        TableName: tableName,
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

    let botResponse;
    try {
        botResponse = await invokeClaude3Sonnet(userMessage);
        console.log('Received response from Bedrock API:', botResponse);
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error invoking Bedrock endpoint'
            })
        };
    }

    const botMessageParams = {
        TableName: tableName,
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
