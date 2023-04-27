'use strict';

const fs = require('fs');
const handleTempusBrokerMessage = require('./index');

test('Should successfully poll the tempus broker queue', () => {
    const sqsMessage = fs.readFileSync('resources/testing/tempus-broker-application-message.json');
    const response = handleTempusBrokerMessage(sqsMessage);
    expect(Object.keys(response)).toContain('applicationJSONDocumentSummaryKey');
    expect(Object.keys(response)).toContain('applicationPDFDocumentSummaryKey');
});

test('Should throw an error if the file types are wrong', () => {
    const sqsMessage = fs.readFileSync(
        'resources/testing/tempus-broker-application-message-invalid.json'
    );
    expect(() => handleTempusBrokerMessage(sqsMessage)).toThrowError(
        'Tempus broker queue message held an invalid file type, only .pdf and .json are supported'
    );
});

test('Should error if file is not valid json', () => {
    const sqsMessage = fs.readFileSync('resources/testing/invalid-json.txt');
    expect(() => handleTempusBrokerMessage(sqsMessage)).toThrowError(SyntaxError);
});
