'use strict';

const retrieveObjectFromBucket = require('../services/s3/index');
const handleTempusBrokerMessage = require('../services/sqs/index');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}
// Handler
exports.handler = async function(event, context) {
    console.log(`## ENVIRONMENT VARIABLES: ${serialize(process.env)}`);
    console.log(`## CONTEXT: ${serialize(context)}`);
    console.log(`## EVENT: ${serialize(event)}`);

    // Currently the tempus broker is setup to handle one event at a time
    const record = event.Records[0];
    console.log('Tempus broker message recieved: ', record.body);

    try {
        const s3Keys = await handleTempusBrokerMessage(record.body);
        console.log(s3Keys);
        const s3ApplicationData = await retrieveObjectFromBucket(
            'cica-document-store',
            Object.values(s3Keys)[1]
        );
        console.log(s3ApplicationData);
    } catch (error) {
        console.trace();
        throw error;
    }

    /** ----------------------- TO-DO -----------------------
     *
     *  Map application data to Oracle object
     *  Submit Oracle object to tempus
     *  Delete JSON from S3
     *  Send request to KTA with S3 Key
     *
     *  -----------------------       -----------------------
     */

    return 'success';
};
