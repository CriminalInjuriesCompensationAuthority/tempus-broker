'use strict';

const {S3ServiceException} = require('@aws-sdk/client-s3');
const retrieveObjectFromBucket = require('./index');

// TO-DO these calls should be mocked so the tests work outside of a local env (use localstack?)

test('Should successfully get the document object from the bucket', async () => {
    const response = await retrieveObjectFromBucket(
        'cica-document-store',
        'check-your-answers-sample.json'
    );
    expect(response).toBeDefined();
});

test('Should throw an error if the object/bucket is not found', async () => {
    await expect(async () =>
        retrieveObjectFromBucket('027-906', 'check-your-answers-sample.json')
    ).rejects.toThrowError(S3ServiceException);
    await expect(async () =>
        retrieveObjectFromBucket('cica-document-store', '027-906')
    ).rejects.toThrowError(S3ServiceException);
});
