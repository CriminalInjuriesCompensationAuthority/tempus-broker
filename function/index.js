'use strict';

const oracledb = require('oracledb');
const s3 = require('../services/s3/index');
const handleTempusBrokerMessage = require('../services/sqs/index');
const mapApplicationDataToOracleObject = require('../services/application-mapper/index');
const createDBPool = require('../db/dbPool');
const insertIntoTempus = require('../db/index');
const logger = require('../services/logging/logger');
const getSecret = require('../services/secret-manager');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

exports.handler = async function(event, context) {
    logger.info(`## CONTEXT: ${serialize(context)}`);
    logger.info(`## EVENT: ${serialize(event)}`);

    // Currently the tempus broker is setup to handle one event at a time
    const record = event.Records[0];
    logger.info('Tempus broker message recieved: ', record.body);
    let dbConn;

    try {
        const bucketName = await getSecret('kta-bucket-name');
        const s3Keys = await handleTempusBrokerMessage(record.body);
        const s3ApplicationData = await s3.retrieveObjectFromBucket(
            bucketName,
            Object.values(s3Keys)[1]
        );
        const applicationOracleObject = await mapApplicationDataToOracleObject(s3ApplicationData);

        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        dbConn = await createDBPool();
        await insertIntoTempus(applicationFormJson, 'APPLICATION_FORM');
        await insertIntoTempus(addressDetailsJson, 'ADDRESS_DETAILS');

        await s3.deleteObjectFromBucket(bucketName, Object.values(s3Keys)[1]);

        /** ----------------------- TO-DO -----------------------
         *
         *  Send request to KTA with S3 Key
         *
         *  -----------------------       -----------------------
         */
    } catch (error) {
        logger.error(error);
        throw error;
    } finally {
        if (dbConn) {
            await oracledb.getPool('TempusBrokerPool').close(0);
        }
    }

    return 'Success!';
};
