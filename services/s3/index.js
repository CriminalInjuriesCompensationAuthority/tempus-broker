'use strict';

const {S3Client, GetObjectCommand} = require('@aws-sdk/client-s3');

// Creates the S3 Client with a given profile
const s3Client = new S3Client({
    region: 'eu-west-2',
    profile: 'tempus-broker-s3'
});

/**
 * @param bucket - String of bucket to access object from
 * @param objectKey - String of object key to retrieve
 * @returns
 */
async function retrieveObjectFromBucket(bucket, objectKey) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey
    });

    try {
        const response = await s3Client.send(command);
        const str = await response.Body.transformToString();
        console.log(str);
        return str;
    } catch (err) {
        console.log(err);
        return err;
    }
}

module.exports = retrieveObjectFromBucket;
