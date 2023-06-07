'use strict';

const {DateTime} = require('luxon');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

function mapApplicationQuestion(data, oracleJson) {
    const columnName = FormFieldsGroupedByTheme[data.theme]?.[data.id];
    let columnValue = null;

    // Check to see if id needs custom mapping
    // Mapping methods sourced from the data dictionary
    if (columnName) {
        switch (data.id) {
            // Creates string I,E,S,C,O based on selected options
            case 'q-applicant-work-details-option':
                if (Object.keys(oracleJson).find(column => column === columnName)) {
                    const i = Object.keys(oracleJson).findIndex(column => column === columnName);
                    columnValue = Object.values(oracleJson)[i];
                    data.value.forEach(option => {
                        columnValue = `${columnValue + option[0].toUpperCase()},`;
                    });
                    columnValue = columnValue.slice(0, -1);
                } else {
                    columnValue = '';
                    data.value.forEach(option => {
                        columnValue = `${columnValue + option},`;
                    });
                }
                break;
            case 'q-applicant-job-when-crime-happened':
                if (
                    data.value === true &&
                    Object.keys(oracleJson).find(column => column === columnName)
                ) {
                    const i = Object.keys(oracleJson).findIndex(column => column === columnName);
                    columnValue = `${Object.values(oracleJson)[i]}I`;
                } else if (data.value === true) {
                    columnValue = 'I,';
                }
                break;
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
                    columnValue = null;
                }
                break;
            case 'q-applicant-physical-injury':
                columnValue = '';
                Object.values(data.value).forEach(option => {
                    columnValue = `${columnValue + option}:`;
                });
                columnValue = columnValue.slice(0, -1);
                break;

            // If custom mapping is not required, map in a generic way
            default:
                // Check to see if value can be parsed from an ISO to a DateTime
                if (!DateTime.fromISO(data.value).invalidReason) {
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
        columnValue
    };
}

module.exports = mapApplicationQuestion;