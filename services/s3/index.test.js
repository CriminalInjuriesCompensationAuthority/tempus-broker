'use strict';

const {GetObjectCommand, S3Client, S3ServiceException} = require('@aws-sdk/client-s3');
const {createReadStream, readFileSync} = require('fs');
const {sdkStreamMixin} = require('@aws-sdk/util-stream-node');
const {mockClient} = require('aws-sdk-client-mock');
const retrieveObjectFromBucket = require('.');

describe('S3 Service', () => {
    const mockS3Client = mockClient(S3Client);

    beforeAll(() => {
        mockS3Client.reset();
    });

    it('Should successfully parse the object from S3 as JSON', async () => {
        // mock the s3client.send response
        const stream = createReadStream('./resources/testing/check-your-answers-sample.json');
        const sdkStream = sdkStreamMixin(stream);
        mockS3Client.on(GetObjectCommand).resolves({
            Body: sdkStream,
            ContentType: 'application/json'
        });

        const response = await retrieveObjectFromBucket();
        expect(response).toEqual(
            JSON.parse(readFileSync('./resources/testing/check-your-answers-sample.json'))
        );
        mockS3Client.restore();
    });

    it('Should throw an error if the object/bucket is not found', async () => {
        await expect(async () =>
            retrieveObjectFromBucket(
                '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
                'check-your-answers-sample.json'
            )
        ).rejects.toThrowError(S3ServiceException, 'The specified bucket does not exist');
        await expect(async () =>
            retrieveObjectFromBucket('cica-document-store', '8d20901b-ed27-4bae-9884-8c5bb7c89b1c')
        ).rejects.toThrowError(S3ServiceException, 'Access denied');
    });
});
