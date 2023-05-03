'use strict';

const retrieveObjectFromBucket = require('../services/s3/index');
const handleTempusBrokerMessage = require('../services/sqs/index');
const logger = require('../services/logging/logger');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}
// Handler
exports.handler = async function(event, context) {
    logger.info(`## CONTEXT: ${serialize(context)}`);
    logger.info(`## EVENT: ${serialize(event)}`);

    // Currently the tempus broker is setup to handle one event at a time
    const record = event.Records[0];
    logger.info('Tempus broker message recieved: ', record.body);

    try {
        const s3Keys = await handleTempusBrokerMessage(record.body);
        const s3ApplicationData = await retrieveObjectFromBucket(
            'cica-document-store',
            Object.values(s3Keys)[1]
        );
        logger.info(s3ApplicationData);
    } catch (error) {
        logger.error(error);
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
