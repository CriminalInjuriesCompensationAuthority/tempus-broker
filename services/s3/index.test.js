'use strict';

const retrieveObjectFromBucket = require('./index');

test('Should successfully get the document object from the bucket', async () => {
    const response = await retrieveObjectFromBucket('placeholder', 'README.md');
    expect(response).toBeDefined();
});
