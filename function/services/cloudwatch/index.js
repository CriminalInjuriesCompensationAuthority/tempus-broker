'use strict';

const AWSXRay = require('aws-xray-sdk');
const {CloudWatchClient, PutMetricDataCommand} = require('@aws-sdk/client-cloudwatch');
const logger = require('../logging/logger');

// Creates the Cloud Watch client with a given profile
AWSXRay.setContextMissingStrategy('IGNORE_ERROR');
const cloudWatchClient = AWSXRay.captureAWSv3Client(
    new CloudWatchClient({
        region: 'eu-west-2',
        endpoint:
            process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test'
                ? 'http://localhost:4566'
                : undefined,
        forcePathStyle: !!(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test')
    })
);

// Logs a custom metric to CloudWatch
async function logCustomCloudWatchMetric(namespace, data) {
    const command = new PutMetricDataCommand({
        MetricData: data,
        Namespace: namespace,
    });
    try {
        return cloudWatchClient.send(command);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

async function logKTALatency(duration, requestUrl){
    const namespace = "tempusBrokerFunction/requests";
    const data = [
        {
            MetricName: "ktaRequestLatency",
            Dimensions: [{ Name: "ktaRequestUrl", Value: requestUrl }],
            Value: duration,
            Unit: "Milliseconds"
        },
    ];
    return logCustomCloudWatchMetric(
        namespace,
        data
    )
}

module.exports = {logKTALatency};
