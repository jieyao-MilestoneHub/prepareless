"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const runtime = new aws_sdk_1.SageMakerRuntime();
exports.handler = async (event) => {
    const endpointName = process.env.SAGEMAKER_ENDPOINT;
    if (!endpointName) {
        throw new Error('SAGEMAKER_ENDPOINT environment variable is not set.');
    }
    const params = {
        EndpointName: endpointName,
        Body: JSON.stringify(event),
        ContentType: 'application/json'
    };
    try {
        const response = await runtime.invokeEndpoint(params).promise();
        return JSON.parse(response.Body);
    }
    catch (error) {
        console.error('Error invoking SageMaker endpoint:', error);
        throw new Error('Error invoking SageMaker endpoint');
    }
};
