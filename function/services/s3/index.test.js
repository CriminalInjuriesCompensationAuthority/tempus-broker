'use strict';

const {GetObjectCommand, S3Client} = require('@aws-sdk/client-s3');
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
        const mockCommand = {
            Bucket: 'test',
            Key: 'test.json'
        };
        const stream = createReadStream(
            'function/resources/testing/check-your-answers-sample.json'
        );
        const sdkStream = sdkStreamMixin(stream);
        mockS3Client.on(GetObjectCommand, mockCommand).resolves({
            Body: sdkStream,
            ContentType: 'application/json'
        });

        const response = await retrieveObjectFromBucket('test', 'test.json');
        expect(response).toEqual(
            JSON.parse(readFileSync('function/resources/testing/check-your-answers-sample.json'))
        );
    });

    it('Should throw an error if the object/bucket is not found', async () => {
        const mockCommand = {
            Bucket: '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
            Key: 'check-your-answers-sample.json'
        };
        mockS3Client
            .on(GetObjectCommand, mockCommand)
            .rejects('The specified bucket does not exist');
        await expect(async () =>
            retrieveObjectFromBucket(
                '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
                'check-your-answers-sample.json'
            )
        ).rejects.toThrowError('The specified bucket does not exist');
    });
});
