'use strict';

const receiveTempusBrokerMessages = require('./index');

test('Should successfully poll the tempus broker queue', async () => {
    const response = await receiveTempusBrokerMessages();
    expect(response).toBeDefined();
});
