"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const db = new aws_sdk_1.DynamoDB.DocumentClient();
const bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: process.env.REGION });
const invokeClaude3Sonnet = async (userMessage) => {
    const input = {
        body: new TextEncoder().encode(userMessage),
        contentType: 'application/json',
        accept: 'application/json',
        modelId: 'claude-3-sonnet'
    };
    const command = new client_bedrock_runtime_1.InvokeModelCommand(input);
    try {
        const response = await bedrockClient.send(command);
        // Ensure the response structure is correct
        if ('body' in response) {
            const responseBody = new TextDecoder().decode(response.body);
            const parsedResponse = JSON.parse(responseBody);
            if ('outputText' in parsedResponse) {
                return parsedResponse.outputText;
            }
        }
        throw new Error('Invalid response from Bedrock');
    }
    catch (error) {
        console.error('Error invoking Bedrock endpoint:', error);
        throw new Error('Error invoking Bedrock endpoint');
    }
};
const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body || '{}');
    const userMessage = body.message;
    const chatId = (0, uuid_1.v4)();
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
    }
    catch (error) {
        console.error('Error saving user message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error saving user message'
            })
        };
    }
    // Invoke Bedrock API
    let botResponse;
    try {
        botResponse = await invokeClaude3Sonnet(userMessage);
        console.log('Received response from Bedrock API:', botResponse);
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error invoking Bedrock endpoint'
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
        console.log('Saved bot message to DynamoDB:', botMessageParams);
    }
    catch (error) {
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
exports.handler = handler;
