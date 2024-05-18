import { SageMakerRuntime } from 'aws-sdk';

const runtime = new SageMakerRuntime();

exports.handler = async (event: any) => {
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
        return JSON.parse(response.Body as string);
    } catch (error) {
        console.error('Error invoking SageMaker endpoint:', error);
        throw new Error('Error invoking SageMaker endpoint');
    }
};
