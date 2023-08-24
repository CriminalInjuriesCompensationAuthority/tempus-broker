'use strict';

const fs = require('fs');
const handleTempusBrokerMessage = require('./index');

describe('SQS Service', () => {
    it('Should successfully poll the tempus broker queue', () => {
        const sqsMessage = fs.readFileSync(
            'function/resources/testing/tempus-broker-application-message.json'
        );
        const response = handleTempusBrokerMessage(sqsMessage);
        expect(Object.keys(response)).toContain('applicationJSONDocumentSummaryKey');
        expect(Object.keys(response)).toContain('applicationPDFDocumentSummaryKey');
    });

    it('Should throw an error if the file types are wrong', () => {
        const sqsMessage = fs.readFileSync(
            'function/resources/testing/tempus-broker-application-message-invalid.json'
        );
        expect(() => handleTempusBrokerMessage(sqsMessage)).toThrowError(
            'Tempus broker queue message held an invalid file type, only .pdf and .json are supported'
        );
    });

    it('Should error if file is not valid json', () => {
        const sqsMessage = fs.readFileSync('function/resources/testing/invalid-json.txt');
        expect(() => handleTempusBrokerMessage(sqsMessage)).toThrowError(SyntaxError);
    });

    // it('Should delete a message from the queue', async () => {
    //     // Arrange
    //     sqsMock.on(DeleteMessageCommand).resolves('Message Deleted');

    //     // Act
    //     const sqsService = createSQSService();
    //     const response = await sqsService.deleteSQS({
    //         QueueUrl: 'Queue',
    //         ReceiptHandle: 'Receipt Handle'
    //     });

    //     // Assert
    //     expect(response).toBe('Message Deleted');
    // });
});
