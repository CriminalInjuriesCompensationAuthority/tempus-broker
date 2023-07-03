'use strict';

const {DateTime} = require('luxon');
const mapApplicationQuestion = require('./application-question');
const addressDetailsColumns = require('../../constants/address-details-columns');

// The initial oracle object
const applicationFormJson = {
    prefix: 'U',
    section_ref: 'TEMP',
    is_eligible: 'Y'
};
const addressDetailsJson = [
    {
        address_type: 'ICA'
    }
];
let crn;
let refYear;

async function mapApplicationDataToOracleObject(data) {
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
                .toFormat('dd-MMM-yy')
                .toLocaleUpperCase();
        }
        if (key === 'id') {
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
                            addressDetailsJson[addressIndex][applicationQuestion.columnName] =
                                applicationQuestion.columnValue;
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
                        addressDetailsJson[i][applicationQuestion.addressColumn] =
                            applicationQuestion.addressValue;
                    } else if (i === addressDetailsJson.length - 1) {
                        addressDetailsJson.push({
                            address_type: applicationQuestion.addressType,
                            [applicationQuestion.addressColumn]: applicationQuestion.addressValue
                        });
                    }
                });
            }
        }
        if (typeof value === 'object') {
            mapApplicationDataToOracleObject(value);
        }
    });

    // Add in the CRN and refYear to each address details object
    Object.values(addressDetailsJson).forEach((values, i) => {
        addressDetailsJson[i].claim_reference_number = crn;
        addressDetailsJson[i].ref_year = refYear;
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
