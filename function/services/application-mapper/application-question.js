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
    let columnValue = '';
    let addressColumn = null;
    let addressValue = null;
    let addressType = null;

    // Check to see if id needs custom mapping
    // Mapping methods sourced from the data dictionary
    if (columnName) {
        switch (true) {
            // Creates string I,E,S,C,O based on selected options
            case data.id === 'q-applicant-work-details-option':
                columnValue = applicationForm?.work_details ? applicationForm.work_details : '';

                data.value.forEach(option => {
                    columnValue = `${columnValue + option[0].toUpperCase()},`;
                });
                columnValue = columnValue.slice(0, -1);
                break;
            case data.id === 'q-applicant-job-when-crime-happened':
                if (data.value && applicationForm?.work_details) {
                    columnValue = `${applicationForm.work_details},I`;
                } else if (data.value) {
                    columnValue = 'I,';
                }
                break;

            // Sets application to PI or POA
            case data.id === 'q-applicant-did-the-crime-happen-once-or-over-time':
                if (data.value === 'once') {
                    columnValue = '2';
                } else if (data.value === 'over-a-period-of-time') {
                    columnValue = '3';
                }
                break;
            case data.id === 'q-applicant-who-are-you-applying-for':
                if (data.value === 'myself') {
                    columnValue = 'Y';
                } else {
                    columnValue = 'N';
                }
                break;

            // Sets who the crime was reported to
            case data.id === 'q--was-the-crime-reported-to-police': {
                // eslint-disable-next-line no-unused-expressions
                data.value ? (columnValue = ['Y', 'Police']) : (columnValue = ['N', null]);
                break;
            }

            case data.id === 'q-applicant-dentist-visited': {
                // eslint-disable-next-line no-unused-expressions
                data.value ? (columnValue = ['Y', 'Y']) : (columnValue = ['N', 'N']);
                break;
            }

            // Adds the physical injury codes
            case data.id === 'q-applicant-physical-injuries':
                columnValue = '';
                Object.values(data.value).forEach(option => {
                    columnValue = `${columnValue + option}:`;
                });
                columnValue = columnValue.slice(0, -1);
                break;

            // Concatenate all these values to the name column under APA address type
            case data.id === 'q-applicant-title':
            case data.id === 'q-applicant-first-name':
            case data.id === 'q-applicant-last-name':
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
            case data.id === 'q-mainapplicant-title':
            case data.id === 'q-mainapplicant-first-name':
            case data.id === 'q-mainapplicant-last-name':
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
            case data.id === 'q-rep-type':
                columnValue = [data.valueLabel, 'Y', 'Y', 'Y'];
                break;
            case data.id === 'q-rep-organisation-name':
                // set org name in the rep address
                addressType = 'RPA';
                addressColumn = 'name';
                addressValue = data.value;
                columnValue = data.value;
                break;
            // Check if phyinj-149 (Other) should be added
            case data.id.startsWith('q-applicant-physical-injuries-') && data.id.endsWith('-other'):
                columnValue = applicationForm?.injury_details_code
                    ? applicationForm.injury_details_code
                    : 'phyinj-149';
                if (!columnValue.endsWith('phyinj-149')) {
                    columnValue += ':phyinj-149';
                }
                break;

            // Check if the applicant is eligible for special expenses
            case data.theme === 'special-expenses':
                if (applicationForm?.applicant_expenses === 'Y') {
                    columnValue = 'Y';
                } else {
                    columnValue = data.value ? 'Y' : 'N';
                }
                break;

            // Check if the applicant was estranged from the deceased
            case data.id === 'q-applicant-living-together':
            case data.id === 'q-applicant-living-apart':
            case data.id === 'q-applicant-capable':
                columnValue = data.value ? 'N' : 'Y';
                break;
            case data.id === 'q-applicant-contact-with-deceased':
                if (data.value === 'We were out of touch with each other') {
                    columnValue = 'Y';
                } else {
                    columnValue = 'N';
                }
                break;

            // Check if the applicant is financially dependent
            case data.id === 'q-applicant-financial-help':
            case data.id === 'q-applicant-physical-help':
                columnValue =
                    applicationForm?.financially_dependent === 'Y' || data.value ? 'Y' : 'N';
                break;

            // Split fatal/funeral applications
            case data.id === 'q-applicant-claim-type': {
                if (applicationForm?.split_funeral) {
                    columnValue = ['FuneralOnly', 7];
                    // Not ideal, if we need to delete other fields from the form in future, then we should consider a better approach
                    delete applicationForm?.split_funeral;
                } else {
                    columnValue = ['FatalityOnly', 4];
                }
                break;
            }
            // The Crime didnt happen in England, Scotland or Wales
            // User is provided with a free text field to enter their address/location
            case data.id === 'q-applicant-crime-location': {
                let pointer = 0;
                let i = 0;
                addressType = 'ICA';
                columnValue = [];

                // The max input length for this field is 140 characters on CW so we don't need to worry about overflow or data loss
                while (pointer < 128) {
                    const originalPointer = pointer;
                    // If there are 32 characters or more available
                    if (data.value[pointer + 33]) {
                        // If the split would occur mid word
                        if (
                            data.value[pointer + 32].match(/^[a-z0-9]+$/i) &&
                            data.value[pointer + 33].match(/^[a-z0-9]+$/i)
                        ) {
                            // Then find the index of the previous whitespace and split there
                            pointer = data.value.lastIndexOf(' ', originalPointer + 32);
                            columnValue[i] = data.value.slice(originalPointer, pointer);
                        } else {
                            pointer += 32;
                            columnValue[i] = data.value.slice(originalPointer, pointer);
                        }
                    } else {
                        columnValue[i] = data.value.slice(pointer);
                        pointer = 130;
                    }
                    i += 1;
                }
                break;
            }
            // If custom mapping is not required, map in a generic way
            default:
                // Check to see if value can be parsed from an ISO to a DateTime
                if (
                    data.format?.value === 'date-time' &&
                    !DateTime.fromISO(data.value).invalidReason
                ) {
                    columnValue = DateTime.fromISO(data.value)
                        .toFormat('dd-MMM-yy')
                        .toLocaleUpperCase();
                } else if (Array.isArray(columnName)) {
                    columnValue = [];
                    columnName.forEach((name, i) => {
                        columnValue[i] = data.value;
                    });
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
