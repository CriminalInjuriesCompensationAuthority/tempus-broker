'use strict';

const {DateTime} = require('luxon');
const mapApplicationQuestion = require('./application-question');
const logger = require('../logging/logger');
const addressDetailsColumns = require('../../constants/address-details-columns');
const {questionIDs, mapPreviousApplication} = require('../question-helpers/previous-application');

const appliedBeforeQuestionIds = questionIDs;

async function mapApplicationDataToOracleObject(data, applicationFormJson, addressDetailsJson) {
    let crn;
    let refYear;

    mapPreviousApplication(data, applicationFormJson);

    Object.entries(data).forEach(entry => {
        const [key, value] = entry;

        // Check if the key is a metadata key which needs to be mapped
        // TO-DO We should expand this to a separate mapper to check for the metadata key if it becomes too long
        if (key === 'caseReference') {
            [refYear, crn] = value.split('\\');
            applicationFormJson.claim_reference_number = crn;
            applicationFormJson.ref_year = refYear;
        }
        if (key === 'submittedDate') {
            applicationFormJson.created_date = DateTime.fromISO(value)
                .toFormat('dd-MMM-yyyy')
                .toLocaleUpperCase();
        }
        if (key === 'splitFuneral') {
            applicationFormJson.split_funeral = true;
        }
        if (key === 'channel') {
            applicationFormJson.channel = value === 'telephone' ? 'T' : 'W';
        }
        if( key === 'owner'){
            applicationFormJson.cica_account = value.isAuthenticated ? 'Y' : 'N';
        }


        // ignore applied before questions as they are handled at the start of this function
        // and those questions can map to the same database columns
        // and I don't want to rely on ordering of the data from the themes
        if (key === 'id' && !appliedBeforeQuestionIds.includes(value)) {
            // If the key is an id then map the value to json and concatenate to the oracle object
            const applicationQuestion = mapApplicationQuestion(
                data,
                applicationFormJson,
                addressDetailsJson
            );

            // Map the question to applicationForm or addressDetails or both
            // When address details, generate one object for each address type
            if (applicationQuestion.columnName) {
                let entryExistsInAddressDetails;
                Object.values(addressDetailsColumns).forEach(addressTypeObject => {
                    entryExistsInAddressDetails =
                        entryExistsInAddressDetails || value in addressTypeObject;
                });
                Object.entries(addressDetailsColumns).forEach(column => {
                    const [type, addressTypeObject] = column;
                    if (addressTypeObject?.[value] && entryExistsInAddressDetails) {
                        // If the type already exists add to existing object - else create new type
                        const addressIndex = addressDetailsJson.findIndex(
                            obj => obj.address_type === type
                        );
                        if (addressIndex > -1) {
                            if (Array.isArray(applicationQuestion.columnValue)) {
                                applicationQuestion.columnValue.forEach((columnValue, i) => {
                                    addressDetailsJson[addressIndex][
                                        applicationQuestion.columnName[i]
                                    ] = applicationQuestion.columnValue[i];
                                });
                            } else {
                                addressDetailsJson[addressIndex][applicationQuestion.columnName] =
                                    applicationQuestion.columnValue;
                            }
                        } else if (Array.isArray(applicationQuestion.columnValue)) {
                            addressDetailsJson.push({
                                address_type: type
                            });
                            applicationQuestion.columnValue.forEach((columnValue, i) => {
                                addressDetailsJson[addressDetailsJson.length - 1][
                                    applicationQuestion.columnName[i]
                                ] = applicationQuestion.columnValue[i];
                            });
                        } else {
                            addressDetailsJson.push({
                                address_type: type,
                                [applicationQuestion.columnName]: applicationQuestion.columnValue
                            });
                        }
                    } else if (
                        !entryExistsInAddressDetails &&
                        Array.isArray(applicationQuestion.columnValue)
                    ) {
                        applicationQuestion.columnValue.forEach((columnValue, i) => {
                            applicationFormJson[applicationQuestion.columnName[i]] =
                                applicationQuestion.columnValue[i];
                        });
                    } else if (!entryExistsInAddressDetails) {
                        applicationFormJson[applicationQuestion.columnName] =
                            applicationQuestion.columnValue;
                    }
                });
            }

            // Question needs to be mapped to address details AND application form
            // TO-DO Move duplicated code to function
            if (applicationQuestion.addressColumn) {
                addressDetailsJson.forEach((obj, i) => {
                    if (obj.address_type === applicationQuestion.addressType) {
                        if (Array.isArray(applicationQuestion.addressValue)) {
                            applicationQuestion.addressValue.forEach((addressValue, j) => {
                                addressDetailsJson[i][applicationQuestion.addressColumn[j]] =
                                    applicationQuestion.addressValue[j];
                            });
                        } else {
                            addressDetailsJson[i][applicationQuestion.addressColumn] =
                                applicationQuestion.addressValue;
                        }
                    }
                    // We dont handle applicationQuestion.addressValue is an array and its a new entry
                    // It will error if we try and do this currently
                    else if (i === addressDetailsJson.length - 1) {
                        addressDetailsJson.push({
                            address_type: applicationQuestion.addressType,
                            [applicationQuestion.addressColumn]: applicationQuestion.addressValue
                        });
                    }
                });
            }
        }
        if (typeof value === 'object' && value) {
            mapApplicationDataToOracleObject(value, applicationFormJson, addressDetailsJson);
        } else if (typeof value === 'object' && !value) {
            logger.info(
                `NULL value parsed in '${key}' for case ${applicationFormJson?.ref_year}-${applicationFormJson?.claim_reference_number}`
            );
        }
    });

    // Add in the CRN and refYear to each address details object
    crn = applicationFormJson?.claim_reference_number;
    refYear = applicationFormJson?.ref_year;
    Object.values(addressDetailsJson).forEach((values, i) => {
        addressDetailsJson[i].claim_reference_number = crn;
        addressDetailsJson[i].ref_year = refYear;
        // Copy the RPA address.name into application_form.rep_organisation
        if (values?.address_type === 'RPA') {
            // Trim to Oracle's column limit of 70 chars
            addressDetailsJson[i].name = addressDetailsJson[i].name.substring(0, 70);
            applicationFormJson.rep_organisation = addressDetailsJson[i]?.name;
        }
    });
    return {
        tables: [
            {
                APPLICATION_FORM: applicationFormJson
            },
            {
                ADDRESS_DETAILS: addressDetailsJson
            }
        ]
    };
}

module.exports = mapApplicationDataToOracleObject;
