'use strict';

const {SQSClient, ReceiveMessageCommand} = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
    region: 'eu-west-2',
    profile: 'tempus-broker-sqs'
});

async function receiveTempusBrokerMessages() {
    const params = {
        AttributeNames: ['SentTimestamp'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['All'],
        QueueUrl: 'placeholder',
        WaitTimeSeconds: 20
    };

    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        console.log('Success, ', data.Messages[0].Body);
        return data; // For unit tests.
    } catch (err) {
        console.log(err);
        return err;
    }
}

module.exports = receiveTempusBrokerMessages;
