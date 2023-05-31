'use strict';

const oracledb = require('oracledb');
const retrieveObjectFromBucket = require('../services/s3/index');
const handleTempusBrokerMessage = require('../services/sqs/index');
const mapApplicationDataToOracleObject = require('../services/application-mapper/index');
const db = require('../db/index');

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
        await db.createDBPool();
        const s3Keys = await handleTempusBrokerMessage(record.body);
        const s3ApplicationData = await retrieveObjectFromBucket(
            'cica-document-store',
            Object.values(s3Keys)[1]
        );
        const applicationOracleObject = await mapApplicationDataToOracleObject(s3ApplicationData);

        logger.info(applicationOracleObject);
        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        await db.insertIntoTempus(applicationFormJson, 'APPLICATION_FORM');
        await db.insertIntoTempus(addressDetailsJson, 'ADDRESS_DETAILS');

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
    } finally {
        await oracledb.getPool('TempusBrokerPool').close(0);
    }

    return 'Success!';
};
