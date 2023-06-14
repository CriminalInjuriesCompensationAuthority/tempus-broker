'use strict';

const mapApplicationQuestion = require('./application-question');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

describe('Application question', () => {
    let oracleJsonObject;
    beforeAll(() => {
        oracleJsonObject = {
            tables: [
                {
                    APPLICATION_FORM: {
                        prefix: 'U',
                        section_ref: 'TEMP',
                        is_eligible: 'Y'
                    }
                },
                {
                    ADDRESS_DETAILS: [
                        {
                            address_type: 'ICA'
                        }
                    ]
                }
            ]
        };
    });

    it('Should not map if the columnName is not found in the form fields list', () => {
        const missingQuestionData = {
            theme: 'no-theme',
            id: 'q-this-question-is-fake',
            value: 'test'
        };
        const mappedQuestion = mapApplicationQuestion(missingQuestionData);
        expect(mappedQuestion.columnName).toBeFalsy();
        expect(mappedQuestion.columnValue).toBeFalsy();
    });

    it('Should map in a generic way', () => {
        const genericQuestionData = {
            theme: 'about-application',
            id: 'q-applicant-british-citizen-or-eu-national',
            value: 'British citizen'
        };

        let mappedQuestion = mapApplicationQuestion(genericQuestionData);
        expect(mappedQuestion.columnName).toEqual(
            FormFieldsGroupedByTheme[genericQuestionData.theme]?.[genericQuestionData.id]
        );
        expect(mappedQuestion.columnValue).toEqual(genericQuestionData.value);

        genericQuestionData.value = true;
        mappedQuestion = mapApplicationQuestion(genericQuestionData);
        expect(mappedQuestion.columnValue).toEqual('Y');
        genericQuestionData.value = 'yes';
        mappedQuestion = mapApplicationQuestion(genericQuestionData);
        expect(mappedQuestion.columnValue).toEqual('Y');

        genericQuestionData.value = false;
        mappedQuestion = mapApplicationQuestion(genericQuestionData);
        expect(mappedQuestion.columnValue).toEqual('N');
        genericQuestionData.value = 'no';
        mappedQuestion = mapApplicationQuestion(genericQuestionData);
        expect(mappedQuestion.columnValue).toEqual('N');
    });

    it('Should map a timestamp to a date format that is accepted by tariff', () => {
        const timestampQuestionData = {
            theme: 'about-application',
            id: 'q-applicant-british-citizen-or-eu-national',
            value: '1970-01-01T00:00:00.000Z'
        };

        const mappedQuestion = mapApplicationQuestion(timestampQuestionData);
        expect(mappedQuestion.columnValue).toEqual('01-JAN-70');
    });

    it('Should keep the value of applicant_expenses as true if its already populated as true', () => {
        const specialExpensesQuestionData = {
            theme: 'special-expenses',
            id: 'q-applicant-se-treatment',
            value: true
        };

        let mappedQuestion = mapApplicationQuestion(specialExpensesQuestionData, oracleJsonObject);
        expect(mappedQuestion.columnName).toBe('applicant_expenses');
        expect(mappedQuestion.columnValue).toBeTruthy();

        specialExpensesQuestionData.value = false;
        Object.values(oracleJsonObject)[0][0].APPLICATION_FORM.applicant_expenses = true;
        mappedQuestion = mapApplicationQuestion(specialExpensesQuestionData, oracleJsonObject);
        expect(mappedQuestion.columnName).toBe('applicant_expenses');
        expect(mappedQuestion.columnValue).toBeTruthy();
    });

    it('Should return an address value and column for certain questions', () => {
        const addressQuestionData = {
            theme: 'rep-details',
            id: 'q-rep-organisation-name',
            value: 'kfc'
        };

        const mappedQuestion = mapApplicationQuestion(addressQuestionData);
        expect(mappedQuestion.columnValue).toBe('kfc');
        expect(mappedQuestion.addressValue).toBe('kfc');
    });

    it('Should map the application type', () => {
        const questionData = {
            theme: 'crime',
            id: 'q-applicant-did-the-crime-happen-once-or-over-time',
            value: 'once'
        };
        let mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('2');

        questionData.value = 'over a period of time';
        mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('3');
    });

    it('Should map who the applicant is', () => {
        const questionData = {
            theme: 'about-application',
            id: 'q-applicant-who-are-you-applying-for',
            value: 'myself'
        };
        let mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('Y');

        questionData.value = 'someone else';
        mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('N');
    });

    it('Should map physical injuries', () => {
        const physicalInjuryData = {
            theme: 'injuries',
            id: 'q-applicant-physical-injury',
            value: ['phyinj-001', 'phyinj-027', 'phinj-727']
        };
        const mappedQuestion = mapApplicationQuestion(physicalInjuryData);
        expect(mappedQuestion.columnValue).toBe('phyinj-001:phyinj-027:phinj-727');
    });

    it('Should map the reporter type', () => {
        const questionData = {
            theme: 'rep-details',
            id: 'q-rep-type',
            value: 'Solicitor',
            valueLabel: 'Solicitor'
        };

        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toContainEqual('Solicitor', 'Y');
    });

    it('Should concatenate applicant names', () => {
        const questionData = {
            theme: 'applicant-details',
            id: 'q-applicant-title',
            value: 'Miss'
        };
        let mappedQuestion = mapApplicationQuestion(questionData, oracleJsonObject);
        expect(mappedQuestion.columnValue).toBe('Miss');
        expect(mappedQuestion.addressValue).toBe('Miss');

        questionData.value = 'Sabina';
        Object.values(oracleJsonObject)[0][1].ADDRESS_DETAILS.push({
            address_type: 'APA',
            name: 'Miss'
        });
        mappedQuestion = mapApplicationQuestion(questionData, oracleJsonObject);
        expect(mappedQuestion.addressValue).toBe('Miss Sabina');
    });

    it('Should create an array of selected options for work details', () => {
        const questionData = {
            theme: 'impact',
            id: 'q-applicant-work-details-option',
            value: ['education', 'other']
        };

        const mappedQuestion = mapApplicationQuestion(questionData, oracleJsonObject);
        expect(mappedQuestion.columnValue).toContainEqual('E', 'O');
    });

    it('Should map when crime happened', () => {
        const questionData = {
            theme: 'impact',
            id: 'q-applicant-job-when-crime-happened',
            value: true
        };

        const mappedQuestion = mapApplicationQuestion(questionData, oracleJsonObject);
        expect(mappedQuestion.columnValue).toContainEqual('I');
    });
});
