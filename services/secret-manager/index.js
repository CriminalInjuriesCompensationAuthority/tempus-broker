'use strict';

const {SSMClient, GetParameterCommand} = require('@aws-sdk/client-ssm');
const AWSXRay = require('aws-xray-sdk');

// Gets a secret with a given name using SSM
async function getSecret(secretName) {
    AWSXRay.setContextMissingStrategy('IGNORE_ERROR');
    const client = AWSXRay.captureAWSv3Client(
        new SSMClient({region: 'eu-west-2', profile: 'tempus-broker-s3'})
    );

    const input = {
        Name: secretName
    };
    const command = new GetParameterCommand(input);
    const response = await client.send(command);
    return response.Parameter.Value;
}

module.exports = getSecret;
