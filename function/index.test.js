const fs = require('fs');
const AWSXRay = require('aws-xray-sdk-core');
const index = require('./index');

AWSXRay.setContextMissingStrategy('LOG_ERROR');

test('Runs function handler', async () => {
    const eventFile = fs.readFileSync('event.json');
    const event = JSON.parse(eventFile);
    const response = await index.handler(event, null);
    expect(JSON.stringify(response)).toContain('success');
});
