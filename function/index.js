'use strict';

require('dotenv').config();
const oracledb = require('oracledb');
const s3 = require('./services/s3/index');
const createSqsService = require('./services/sqs/index');
const mapApplicationDataToOracleObject = require('./services/application-mapper/index');
const createDBPool = require('./db/dbPool');
const insertIntoTempus = require('./db/index');
const setEligibility = require('./services/eligibility-checker/index');
const createKtaJob = require('./services/kta/index');
const addressInvoiceMapper = require('./services/address-invoice-mapper');
const logger = require('./services/logging/logger');
const getParameter = require('./services/ssm');
const getApplicationFormDefault = require('./constants/application-form-default');
const getAddressDetailsDefault = require('./constants/address-details-default');
const getSecret = require('./services/secret-manager/index');

function serialize(object) {
    return JSON.stringify(object, null, 2);
}

function extractTariffReference(applicationJson) {
    return applicationJson.meta.caseReference.split('\\')[1];
}

// validate that the response contains JSON and PDF keys only
function validateS3Keys(keys) {
    Object.values(keys).forEach(value => {
        if (!value || typeof value !== 'string') {
            throw new Error('Tempus broker queue message is missing required S3 keys');
        }
        if (value.endsWith('.json') || value.endsWith('.pdf')) {
            logger.info(`S3 Key received from tempus broker queue: ${value}`);
        } else {
            throw new Error(
                'Tempus broker queue message held an invalid file type, only .pdf and .json are supported'
            );
        }
    });
}

// Parses the data from an event body which has been received from the tempus broker queue
function handleTempusBrokerMessage(data) {
    let messageBody;
    try {
        messageBody = JSON.parse(data);
    } catch (err) {
        logger.error({err}, 'Failed to parse Tempus broker message body');
        throw err;
    }

    const {applicationJSONDocumentSummaryKey, applicationPDFDocumentSummaryKey} = messageBody;

    // Only validate the S3 keys — not the questionnaireId
    validateS3Keys({applicationJSONDocumentSummaryKey, applicationPDFDocumentSummaryKey});

    return {applicationJSONDocumentSummaryKey, applicationPDFDocumentSummaryKey};
}
function getAnswerFromThemes(themes, themeId, answerId) {
    return themes
        .find(theme => theme.id === themeId)
        ?.values?.find(answer => answer.id === answerId)?.value;
}

function getApplicationOrigin(applicationData, TEST_EMAILS = '') {
    const emailAddresses = [
        getAnswerFromThemes(
            applicationData.themes,
            'applicant-details',
            'q-applicant-enter-your-email-address'
        ),
        getAnswerFromThemes(
            applicationData.themes,
            'main-applicant-details',
            'q-mainapplicant-enter-your-email-address'
        ),
        getAnswerFromThemes(applicationData.themes, 'rep-details', 'q-rep-email-address')
    ];

    return emailAddresses.some(email => email && TEST_EMAILS.includes(email))
        ? 'internal'
        : 'external';
}

async function handler(event, context) {
    const applicationFormDefault = getApplicationFormDefault();
    const addressDetailsDefault = getAddressDetailsDefault();
    logger.info(`## CONTEXT: ${serialize(context)}`);
    logger.info(`## EVENT: ${serialize(event)}`);

    const sessionId = await getParameter('kta-session-id');

    const sqsService = createSqsService();

    // Currently the tempus broker is setup to handle one event at a time
    const receiveInput = {
        QueueUrl: process.env.TEMPUS_QUEUE,
        MaxNumberOfMessages: 1
    };
    const response = await sqsService.receiveSQS(receiveInput);

    // Return early if there are no messages to consume.
    if (!response.Messages) {
        logger.info('No messages received');
        return 'Nothing to process';
    }

    const message = response.Messages[0];
    logger.info('Message received from SQS queue: ', message);

    let dbConn;
    let questionnaireId;
    let caseReference;

    try {
        logger.info('Retrieving data from bucket.');
        const bucketName = await getParameter('kta-bucket-name');

        const {
            applicationJSONDocumentSummaryKey,
            applicationPDFDocumentSummaryKey
        } = handleTempusBrokerMessage(message.Body);

        try {
            questionnaireId = JSON.parse(message.Body).questionnaireId;
        } catch (err) {
            logger.warn({err}, 'Failed to extract questionnaireId from message body');
        }

        const s3ApplicationData = await s3.retrieveObjectFromBucket(
            bucketName,
            applicationJSONDocumentSummaryKey
        );
        const summaryUrl = `s3://${bucketName}/${applicationPDFDocumentSummaryKey}`;
        caseReference = s3ApplicationData.meta.caseReference;

        logger.info({questionnaireId, caseReference}, 'Processing Tempus broker message');

        const {MAINTENANCE_MODE, TEST_EMAILS} = JSON.parse(
            await getSecret(process.env.TEMPUS_BROKER_SECRET_ARN)
        );
        const maintenanceMode = MAINTENANCE_MODE === 'true';

        if (
            maintenanceMode &&
            getApplicationOrigin(s3ApplicationData, TEST_EMAILS) === 'external'
        ) {
            logger.info(
                {questionnaireId, caseReference},
                'External traffic received. Maintenance mode is on.'
            );
            return 'Nothing to process';
        }

        logger.info({questionnaireId, caseReference}, 'Mapping application data to Oracle object.');
        const applicationOracleObject = await mapApplicationDataToOracleObject(
            s3ApplicationData,
            applicationFormDefault,
            addressDetailsDefault
        );

        logger.info({questionnaireId, caseReference}, `Successfully mapped to Oracle object`);
        const applicationFormJson = Object.values(applicationOracleObject)[0][0].APPLICATION_FORM;
        const addressDetailsJson = Object.values(applicationOracleObject)[0][1].ADDRESS_DETAILS;

        logger.info({questionnaireId, caseReference}, 'Checking application eligibility');
        setEligibility(s3ApplicationData, applicationFormJson);

        const addressDetailsWithInvoices = addressInvoiceMapper(
            addressDetailsJson,
            applicationFormJson
        );
        logger.info({questionnaireId, caseReference}, 'Creating Database Pool');
        dbConn = await createDBPool();

        logger.info({questionnaireId, caseReference}, 'Writing application data into Tariff');

        await insertIntoTempus(applicationFormJson, 'APPLICATION_FORM');
        await insertIntoTempus(addressDetailsWithInvoices, 'ADDRESS_DETAILS');

        if (!(process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test')) {
            logger.info({questionnaireId, caseReference}, 'Call out to KTA SDK');
            const tariffReference = extractTariffReference(s3ApplicationData);
            const inputVars = [
                {Id: 'pTARIFF_REFERENCE', Value: tariffReference},
                {Id: 'pSUMMARY_URL', Value: summaryUrl}
            ];
            logger.info(
                {questionnaireId, caseReference, tariffReference},
                `InputVars: ${JSON.stringify(inputVars)}`
            );

            await createKtaJob(sessionId, 'Case Work - Application for Compensation', inputVars);
        }

        // Finally delete the consumed message from the Tempus Queue
        const deleteInput = {
            QueueUrl: process.env.TEMPUS_QUEUE,
            ReceiptHandle: message.ReceiptHandle
        };
        sqsService.deleteSQS(deleteInput);
        logger.info({questionnaireId, caseReference}, 'Tempus broker processing complete');
    } catch (error) {
        logger.error(
            {err: error, questionnaireId, caseReference},
            'Tempus broker processing failed'
        );
        throw error;
    } finally {
        if (dbConn) {
            await oracledb.getPool('TempusBrokerPool').close(0);
        }
    }

    return 'Success!';
}

module.exports = {handler, handleTempusBrokerMessage};
