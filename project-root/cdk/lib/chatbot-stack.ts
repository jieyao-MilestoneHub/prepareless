import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ChatbotStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create DynamoDB table
        const table = new dynamodb.Table(this, 'ChatHistoryTable', {
            partitionKey: { name: 'chatId', type: dynamodb.AttributeType.STRING }
        });

        // Create Lambda function
        const chatbotHandler = new lambda.Function(this, 'ChatbotHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('cdk/lambda'), // 指向正确的目录
            handler: 'chatbotHandler.handler',
            environment: {
                TABLE_NAME: table.tableName
            }
        });

        // Grant Lambda function read/write permissions to the table
        table.grantReadWriteData(chatbotHandler);

        // Create API Gateway REST API
        const api = new apigateway.RestApi(this, 'ChatbotApi', {
            restApiName: 'Chatbot Service',
            description: 'This service handles chatbot requests.'
        });

        // Integrate Lambda function with API Gateway
        const getChatbotIntegration = new apigateway.LambdaIntegration(chatbotHandler, {
            requestTemplates: { 'application/json': '{"statusCode": 200}' }
        });

        api.root.addMethod('POST', getChatbotIntegration); // POST / 
    }
}
