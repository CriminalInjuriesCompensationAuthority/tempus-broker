'use strict';

const ApplicationQuestion = require('./application-question');
const addressDetailsColumns = require('../../constants/address-details-columns');
const mapTimestampToTariffFormat = require('./date-part-mapper');

// The initial oracle object
const oracleJsonObject = {
    tables: [
        {
            APPLICATION_FORM: {
                prefix: 'U',
                section_ref: 'TEMP'
            }
        },
        {
            // TO-DO This will be dynamically set in the future
            ADDRESS_DETAILS: {
                address_type: 'ICA'
            }
        }
    ]
};

async function mapApplicationDataToOracleObject(data) {
    const applicationFormJson = Object.values(oracleJsonObject)[0][0].APPLICATION_FORM;
    const addressDetailsJson = Object.values(oracleJsonObject)[0][1].ADDRESS_DETAILS;
    Object.entries(data).forEach(entry => {
        const [key, value] = entry;

        // Check if the key is a metadata key which needs to be mapped
        // TO-DO We should expand this to a separate mapper to check for the metadata key if it becomes too long
        if (key === 'tariffID') {
            const crn = value.split('\\')[1];
            const refYear = value.split('\\')[0];
            applicationFormJson.claim_reference_number = crn;
            addressDetailsJson.claim_reference_number = crn;

            applicationFormJson.ref_year = refYear;
            addressDetailsJson.ref_year = refYear;
        }
        if (key === 'submittedDate') {
            applicationFormJson.created_date = mapTimestampToTariffFormat(value);
        }
        if (key === 'id') {
            // If the key is an id then map the value to json and concatenate to the oracle object
            const applicationQuestion = new ApplicationQuestion(data, oracleJsonObject);

            // Map the question to either applicationForm or addressDetails
            if (applicationQuestion.columnName) {
                if (Object.values(addressDetailsColumns).find(qid => qid === value)) {
                    addressDetailsJson[applicationQuestion.columnName] =
                        applicationQuestion.columnValue;
                } else {
                    applicationFormJson[applicationQuestion.columnName] =
                        applicationQuestion.columnValue;
                }
            }
        }
        if (value instanceof Object) {
            mapApplicationDataToOracleObject(value);
        }
    });
    return oracleJsonObject;
}

module.exports = mapApplicationDataToOracleObject;
