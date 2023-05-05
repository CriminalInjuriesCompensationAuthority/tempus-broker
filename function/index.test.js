'use strict';

const fs = require('fs');
const index = require('./index');

describe('Tempus broker function', () => {
    it.skip('Should run the function handler', async () => {
        const eventFile = fs.readFileSync('resources/testing/event.json');
        const event = JSON.parse(eventFile);
        const response = await index.handler(event, null);
        expect(response).toContain('success');
    });

    it('Should error if event body contains files with invalid types', async () => {
        const eventFile = fs.readFileSync('resources/testing/event-with-invalid-files.json');
        const event = JSON.parse(eventFile);
        await expect(async () => index.handler(event, null)).rejects.toThrowError(
            'Tempus broker queue message held an invalid file type, only .pdf and .json are supported'
        );
    });
});
