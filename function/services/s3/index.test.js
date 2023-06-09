'use strict';

const {GetObjectCommand, S3Client, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const {createReadStream, readFileSync} = require('fs');
const {sdkStreamMixin} = require('@aws-sdk/util-stream-node');
const {mockClient} = require('aws-sdk-client-mock');
const s3 = require('.');

describe('S3 Service', () => {
    const mockS3Client = mockClient(S3Client);

    beforeAll(() => {
        mockS3Client.reset();
    });

    it('Should successfully parse the object from S3 as JSON', async () => {
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

        const response = await s3.retrieveObjectFromBucket('test', 'test.json');
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
            s3.retrieveObjectFromBucket(
                '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
                'check-your-answers-sample.json'
            )
        ).rejects.toThrowError('The specified bucket does not exist');
    });

    it('Should delete an object from a bucket', async () => {
        const mockCommand = {
            Bucket: '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
            Key: 'check-your-answers-sample.json'
        };
        mockS3Client.on(DeleteObjectCommand, mockCommand).resolves({
            metadata: 'test',
            DeleteMarker: true
        });

        const response = await s3.deleteObjectFromBucket(
            '8d20901b-ed27-4bae-9884-8c5bb7c89b1c',
            'check-your-answers-sample.json'
        );
        expect(Object.hasOwn(response, 'DeleteMarker')).toBeTruthy();
        expect(response.DeleteMarker).toBeTruthy();
    });
});
