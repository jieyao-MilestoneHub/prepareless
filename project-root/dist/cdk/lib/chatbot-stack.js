"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
class ChatbotStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.ChatbotStack = ChatbotStack;
