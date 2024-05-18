"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const db = new aws_sdk_1.DynamoDB.DocumentClient();
const bedrockEndpoint = process.env.BEDROCK_ENDPOINT || '';
const apiKey = process.env.BEDROCK_API_KEY || '';
const invokeClaude3Sonnet = async (userMessage) => {
    const payload = {
        model: 'claude-3-sonnet',
        input: userMessage
    };
    try {
        const response = await axios_1.default.post(bedrockEndpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.data.output;
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
