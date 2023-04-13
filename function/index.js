// Example of using AWS SDK - probably want to take this out into a service class
// AWS X-Ray is a great tracing tool
const {S3Client} = require('@aws-sdk/client-s3');
const AWSXRay = require('aws-xray-sdk');

// Create client outside of handler to reuse
const s3 = AWSXRay.captureAWSv3Client(new S3Client({region: 'eu-west-2'}));

// Handler
exports.handler = async function(event, context) {
    event.Records.forEach(record => {
        console.log(record.body);
    });
    console.log(`## ENVIRONMENT VARIABLES: ${serialize(process.env)}`);
    console.log(`## CONTEXT: ${serialize(context)}`);
    console.log(`## EVENT: ${serialize(event)}`);

    return serialize('success');
};

var serialize = function(object) {
    return JSON.stringify(object, null, 2);
};
