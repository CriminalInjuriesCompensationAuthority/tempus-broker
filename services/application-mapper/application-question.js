'use strict';

const AboutApplicationFormFields = require('../../constants/form-fields/about-application-form-fields');
const CrimeFormFields = require('../../constants/form-fields/crime-form-fields');
const InjuriesFormFields = require('../../constants/form-fields/injuries-form-fields');
const PregnancyFormFields = require('../../constants/form-fields/pregnancy-form-fields');
const ImpactFormFields = require('../../constants/form-fields/impact-form-fields');
const ApplicantDetailsFormFields = require('../../constants/form-fields/applicant-details-form-fields');
const MentalHealthFormFields = require('../../constants/form-fields/mental-health-form-fields');
const OffenderFormFields = require('../../constants/form-fields/offender-form-fields');
const TreatmentFormFields = require('../../constants/form-fields/treatment-form-fields');
const OtherCompensationFormFields = require('../../constants/form-fields/other-compensation-form-fields');
const mapTimestampToTariffFormat = require('./date-part-mapper');

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
        switch (this.id) {
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

            // Map Y, N or null
            case 'q-applicant-infections':
            case 'q-applicant-pregnancy-loss':
                if (this.value === 'yes') {
                    this.columnValue = 'Y';
                    break;
                } else if (this.value === 'no') {
                    this.columnValue = 'N';
                    break;
                } else {
                    this.columnValue = null;
                    break;
                }
            // Maps timestamp to tariff date
            case 'q--when-was-the-crime-reported-to-police':
            case 'q-applicant-enter-your-date-of-birth':
            case 'q-applicant-when-did-the-crime-happen':
                this.columnValue = mapTimestampToTariffFormat(this.value);
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
                    default:
                        this.columnValue = this.value;
                        break;
                }
        }
    }

    // Get the column name based off the question id
    // Form fields are grouped by theme to separate data
    // TO-DO if this gets out of hand - automatically detect the form field type using string manipulation
    getColumnName(theme) {
        let formFields;
        switch (theme) {
            case 'about-application':
                formFields = AboutApplicationFormFields;
                break;
            case 'applicant-details':
                formFields = ApplicantDetailsFormFields;
                break;
            case 'crime':
                formFields = CrimeFormFields;
                break;
            case 'offender':
                formFields = OffenderFormFields;
                break;
            case 'mental-health':
                formFields = MentalHealthFormFields;
                break;
            case 'impact':
                formFields = ImpactFormFields;
                break;
            case 'injuries':
                formFields = InjuriesFormFields;
                break;
            case 'pregnancy':
                formFields = PregnancyFormFields;
                break;
            case 'treatment':
                formFields = TreatmentFormFields;
                break;
            case 'other-compensation':
                formFields = OtherCompensationFormFields;
                break;
            default:
                formFields = null;
        }
        if (formFields) {
            Object.entries(formFields).forEach(entry => {
                const [column, qid] = entry;
                if (!Array.isArray(qid) && qid === this.id) {
                    this.columnName = column;
                }
                if (Array.isArray(qid) && qid.find(id => id === this.id)) {
                    this.columnName = column;
                }
            });
        }
    }
};
