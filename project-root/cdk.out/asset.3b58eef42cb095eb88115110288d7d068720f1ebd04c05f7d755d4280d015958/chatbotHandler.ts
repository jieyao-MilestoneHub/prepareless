import { DynamoDB } from 'aws-sdk';

const tableName = process.env.TABLE_NAME || '';
const db = new DynamoDB.DocumentClient();

exports.handler = async (event: any) => {
    // Your Lambda handler code here
    console.log('Event: ', event);

    // Save chat history to DynamoDB
    const params = {
        TableName: tableName,
        Item: {
            chatId: event.chatId,
            message: event.message,
            timestamp: new Date().toISOString()
        }
    };

    try {
        await db.put(params).promise();
        return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
    } catch (error) {
        console.error('Error saving chat history:', error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Error saving chat history' }) };
    }
};
