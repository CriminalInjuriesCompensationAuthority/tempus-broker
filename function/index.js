'use strict';

const retrieveObjectFromBucket = require('../services/s3/index');
const handleTempusBrokerMessage = require('../services/sqs/index');
const mapApplicationDataToOracleObject = require('../services/application-mapper/index');
const createDBConnection = require('../db/index');
const logger = require('../services/logging/logger');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

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
        const applicationOracleObject = await mapApplicationDataToOracleObject(s3ApplicationData);
        await createDBConnection(applicationOracleObject);

        /** ----------------------- TO-DO -----------------------
         *
         *  Delete JSON from S3
         *  Send request to KTA with S3 Key
         *
         *  -----------------------       -----------------------
         */
    } catch (error) {
        logger.error(error);
        throw error;
    }

    return 'Success!';
};
