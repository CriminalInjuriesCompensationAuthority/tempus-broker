'use strict';

const {DateTime} = require('luxon');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

module.exports = class ApplicationQuestion {
    constructor(data, oracleJson) {
        this.value = data.value;
        this.id = data.id;
        this.type = data.type;
        this.label = data.label;
        this.sectionId = data.sectionId;
        this.theme = data.theme;
        this.columnName = null;
        this.columnValue = null;

        this.getColumnName(this.theme);

        // Check to see if id needs custom mapping
        // Mapping methods sourced from the data dictionary
        switch (this.id) {
            // Creates string I,E,S,C,O based on selected options
            case 'q-applicant-work-details-option':
                if (Object.keys(oracleJson).find(column => column === this.columnName)) {
                    const i = Object.keys(oracleJson).findIndex(
                        column => column === this.columnName
                    );
                    this.columnValue = Object.values(oracleJson)[i];
                    this.value.forEach(option => {
                        this.columnValue = `${this.columnValue + option[0].toUpperCase()},`;
                    });
                    this.columnValue = this.columnValue.slice(0, -1);
                } else {
                    this.columnValue = '';
                    this.value.forEach(option => {
                        this.columnValue = `${this.columnValue + option},`;
                    });
                }
                break;
            case 'q-applicant-job-when-crime-happened':
                if (
                    this.value === true &&
                    Object.keys(oracleJson).find(column => column === this.columnName)
                ) {
                    const i = Object.keys(oracleJson).findIndex(
                        column => column === this.columnName
                    );
                    this.columnValue = `${Object.values(oracleJson)[i]}I`;
                } else if (this.value === true) {
                    this.columnValue = 'I,';
                }
                break;
            case 'q-applicant-did-the-crime-happen-once-or-over-time':
                if (this.value === 'once') {
                    this.columnValue = '2';
                } else if (this.value === 'over a period of time') {
                    this.columnValue = '3';
                }
                break;
            case 'q-applicant-who-are-you-applying-for':
                if (this.value === 'myself') {
                    this.columnValue = 'Y';
                } else {
                    this.columnValue = null;
                }
                break;
            case 'q-applicant-physical-injury':
                this.columnValue = '';
                Object.values(this.value).forEach(option => {
                    this.columnValue = `${this.columnValue + option}:`;
                });
                this.columnValue = this.columnValue.slice(0, -1);
                break;

            // Maps timestamp to tariff date
            case 'q--when-was-the-crime-reported-to-police':
            case 'q-applicant-enter-your-date-of-birth':
            case 'q-applicant-when-did-the-crime-happen':
                this.columnValue = DateTime.fromISO(this.value)
                    .toFormat('dd-MMM-yy')
                    .toLocaleUpperCase();
                break;

            // If custom mapping is not required, map in a generic way
            default:
                switch (this.value) {
                    case true:
                        this.columnValue = 'Y';
                        break;
                    case false:
                        this.columnValue = 'N';
                        break;
                    case 'yes':
                        this.columnValue = 'Y';
                        break;
                    case 'no':
                        this.columnValue = 'N';
                        break;
                    default:
                        this.columnValue = this.value;
                        break;
                }
        }
    }

    // Get the column name based off the question id
    // Form fields are grouped by theme to separate data
    getColumnName(theme) {
        Object.entries(FormFieldsGroupedByTheme).forEach(entry => {
            const [themeName, questions] = entry;
            if (theme === themeName) {
                Object.entries(questions).forEach(question => {
                    const [column, qid] = question;
                    if (!Array.isArray(qid) && qid === this.id) {
                        this.columnName = column;
                    }
                    if (Array.isArray(qid) && qid.find(id => id === this.id)) {
                        this.columnName = column;
                    }
                });
            }
        });
    }
};
