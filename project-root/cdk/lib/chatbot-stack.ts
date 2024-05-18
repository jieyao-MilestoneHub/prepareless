import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ChatbotStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 创建DynamoDB表
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

        // 授予Lambda函数访问DynamoDB表的权限
        chatHistoryTable.grantReadWriteData(chatbotHandler);
        chatHistoryTable.grantReadWriteData(bedrockHandler);

        // 授予BedrockHandler Lambda调用Bedrock API的权限
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

        // 将Lambda函数与API Gateway集成
        const chatbotIntegration = new apigateway.LambdaIntegration(chatbotHandler, {
            requestTemplates: { 'application/json': '{"statusCode": 200}' }
        });
        const bedrockIntegration = new apigateway.LambdaIntegration(bedrockHandler, {
            requestTemplates: { 'application/json': '{"statusCode": 200}' }
        });

        // 创建API Gateway端点
        const chatbotResource = api.root.addResource('chatbot');
        chatbotResource.addMethod('POST', chatbotIntegration);

        const bedrockResource = api.root.addResource('bedrock');
        bedrockResource.addMethod('POST', bedrockIntegration);

        // 创建API Gateway角色并授予必要权限
        const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
        });

        // 授予API Gateway角色调用每个Lambda函数的权限
        chatbotHandler.grantInvoke(apiGatewayRole);
        bedrockHandler.grantInvoke(apiGatewayRole);

        // 将策略附加到API Gateway角色
        apiGatewayRole.addToPolicy(new iam.PolicyStatement({
            actions: ['lambda:InvokeFunction'],
            resources: [chatbotHandler.functionArn, bedrockHandler.functionArn],
        }));
    }
}
