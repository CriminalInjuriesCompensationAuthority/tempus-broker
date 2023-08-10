'use strict';

const fs = require('fs');
const {handler, handleTempusBrokerMessage} = require('./index');

describe('Tempus broker function', () => {
    it('Should run the function handler', async () => {
        jest.setTimeout(60000);
        const response = await handler({}, null);
        expect(response).toContain('Success!');
    });

    it('Should error if event body contains files with invalid types', async () => {
        const sqsMessage = fs.readFileSync('function/resources/testing/sqsMessage.json');
        const response = handleTempusBrokerMessage(JSON.parse(sqsMessage).Messages[0].Body);
        expect(Object.keys(response)).toContain('applicationJSONDocumentSummaryKey');
        expect(Object.keys(response)).toContain('applicationPDFDocumentSummaryKey');
    });
});
