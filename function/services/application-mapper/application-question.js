'use strict';

const {DateTime} = require('luxon');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

function concatenateToExistingAddressColumn(addressDetails, addressType, addressColumn, dataValue) {
    let exists;
    let index;
    addressDetails.forEach(value => {
        exists = value?.[addressColumn] && value.address_type === addressType;
        if (exists) {
            index = addressDetails.findIndex(found => found === value);
        }
    });
    if (exists) {
        return `${addressDetails[index][addressColumn]} ${dataValue}`;
    }
    return dataValue;
}

function mapApplicationQuestion(data, applicationForm, addressDetails) {
    const columnName = FormFieldsGroupedByTheme[data.theme]?.[data.id];
    let columnValue = null;
    let addressColumn = null;
    let addressValue = null;
    let addressType = null;

    // Check to see if id needs custom mapping
    // Mapping methods sourced from the data dictionary
    if (columnName) {
        switch (data.id) {
            // Creates string I,E,S,C,O based on selected options
            case 'q-applicant-work-details-option':
                columnValue = applicationForm?.work_details ? applicationForm.work_details : null;

                data.value.forEach(option => {
                    columnValue = `${columnValue + option[0].toUpperCase()},`;
                });
                columnValue = columnValue.slice(0, -1);
                break;
            case 'q-applicant-job-when-crime-happened':
                if (data.value && applicationForm?.work_details) {
                    columnValue = `${applicationForm.work_details},I`;
                } else if (data.value) {
                    columnValue = 'I,';
                }
                break;

            // Sets application to PI or POA
            case 'q-applicant-did-the-crime-happen-once-or-over-time':
                if (data.value === 'once') {
                    columnValue = '2';
                } else if (data.value === 'over a period of time') {
                    columnValue = '3';
                }
                break;
            case 'q-applicant-who-are-you-applying-for':
                if (data.value === 'myself') {
                    columnValue = 'Y';
                } else {
                    columnValue = 'N';
                }
                break;
            case 'q-applicant-physical-injury':
                columnValue = '';
                Object.values(data.value).forEach(option => {
                    columnValue = `${columnValue + option}:`;
                });
                columnValue = columnValue.slice(0, -1);
                break;

            // Concatenate all these values to the name column under APA address type
            case 'q-applicant-title':
            case 'q-applicant-first-name':
            case 'q-applicant-last-name':
                addressColumn = 'name';
                addressType = 'APA';
                columnValue = data.value;
                addressValue = concatenateToExistingAddressColumn(
                    addressDetails,
                    addressType,
                    addressColumn,
                    data.value
                );
                break;

            // Concatenate all these values to the name column under PAB address type
            case 'q-mainapplicant-title':
            case 'q-mainapplicant-first-name':
            case 'q-mainapplicant-last-name':
                addressColumn = 'name';
                addressType = 'PAB';
                columnValue = data.value;
                addressValue = concatenateToExistingAddressColumn(
                    addressDetails,
                    addressType,
                    addressColumn,
                    data.value
                );
                break;

            // We need to map this value to multiple columns, so we return an array of values
            case 'q-rep-type':
                columnValue = [data.valueLabel, 'Y', 'Y'];
                break;
            case 'q-rep-organisation-name':
                addressType = 'RPA';
                addressColumn = 'name';
                addressValue = data.value;
                columnValue = data.value;
                break;
            // If custom mapping is not required, map in a generic way
            default:
                // Check if the applicant is eligible for special expenses
                if (data.theme === 'special-expenses') {
                    columnValue = applicationForm?.applicant_expenses ? 'true' : 'false';
                }
                // Check to see if value can be parsed from an ISO to a DateTime
                else if (!DateTime.fromISO(data.value).invalidReason) {
                    columnValue = DateTime.fromISO(data.value)
                        .toFormat('dd-MMM-yy')
                        .toLocaleUpperCase();
                } else {
                    switch (data.value) {
                        case true:
                            columnValue = 'Y';
                            break;
                        case false:
                            columnValue = 'N';
                            break;
                        case 'yes':
                            columnValue = 'Y';
                            break;
                        case 'no':
                            columnValue = 'N';
                            break;
                        default:
                            columnValue = data.value;
                            break;
                    }
                }
        }
    }
    return {
        columnName,
        columnValue,
        addressColumn,
        addressValue,
        addressType
    };
}

module.exports = mapApplicationQuestion;
