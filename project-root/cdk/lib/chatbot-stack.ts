import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ChatbotStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 建立DynamoDB表格
        const chatHistoryTable = new dynamodb.Table(this, 'ChatHistoryTable', {
            partitionKey: { name: 'chatId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // Chatbot Handler Lambda
        const chatbotHandler = new lambda.Function(this, 'ChatbotHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'chatbotHandler.handler',
            code: lambda.Code.fromAsset('cdk/lambda'),
            environment: {
                TABLE_NAME: chatHistoryTable.tableName,
                REGION: this.region,
            },
        });

        // Bedrock Handler Lambda
        const bedrockHandler = new lambda.Function(this, 'BedrockHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'bedrockHandler.handler',
            code: lambda.Code.fromAsset('cdk/lambda'),
            environment: {
                TABLE_NAME: chatHistoryTable.tableName,
                REGION: this.region,
            },
        });

        // 授予Lambda函數存取DynamoDB表的權限
        chatHistoryTable.grantReadWriteData(chatbotHandler);
        chatHistoryTable.grantReadWriteData(bedrockHandler);

        // 授予BedrockHandler Lambda呼叫Bedrock API的權限
        const bedrockPolicy = new iam.PolicyStatement({
            actions: ['bedrock:InvokeModel'],
            resources: ['*'],
        });
        bedrockHandler.addToRolePolicy(bedrockPolicy);

        // 配置API Gateway
        const api = new apigateway.RestApi(this, 'ChatbotApi', {
            restApiName: 'Chatbot Service',
            description: 'This service serves the chatbot.',
        });

        // 將Lambda函數與API Gateway集成
        const chatbotIntegration = new apigateway.LambdaIntegration(chatbotHandler, {
            requestTemplates: { 'application/json': '{"statusCode": 200}' }
        });
        const bedrockIntegration = new apigateway.LambdaIntegration(bedrockHandler, {
            requestTemplates: { 'application/json': '{"statusCode": 200}' }
        });

        // 建立API Gateway端點
        const chatbotResource = api.root.addResource('chatbot');
        chatbotResource.addMethod('POST', chatbotIntegration);

        const bedrockResource = api.root.addResource('bedrock');
        bedrockResource.addMethod('POST', bedrockIntegration);

        // 建立API Gateway角色並授予必要權限
        const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });

        // 授予API Gateway角色呼叫每個Lambda函數的權限
        chatbotHandler.grantInvoke(apiGatewayRole);
        bedrockHandler.grantInvoke(apiGatewayRole);

        // 將策略附加到API Gateway角色
        apiGatewayRole.addToPolicy(new iam.PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [chatbotHandler.functionArn, bedrockHandler.functionArn],
        }));
    }
}