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
class ChatbotStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create DynamoDB table
        const table = new dynamodb.Table(this, 'ChatHistoryTable', {
            partitionKey: { name: 'chatId', type: dynamodb.AttributeType.STRING }
        });
        // Create Lambda function
        const chatbotHandler = new lambda.Function(this, 'ChatbotHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('lambda'),
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
exports.ChatbotStack = ChatbotStack;
