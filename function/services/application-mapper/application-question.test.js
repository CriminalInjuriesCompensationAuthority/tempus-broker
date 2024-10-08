'use strict';

const mapApplicationQuestion = require('./application-question');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

describe('Application question', () => {
    let applicationForm;
    let addressDetails;
    beforeAll(() => {
        applicationForm = {
            prefix: 'U',
            section_ref: 'TEMP',
            is_eligible: 'Y'
        };
        addressDetails = [
            {
                address_type: 'ICA'
            }
        ];
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
            id: 'q-applicant-enter-your-date-of-birth',
            type: 'simple',
            label: 'Date of birth',
            value: '1970-01-01T00:00:00.000Z',
            sectionId: 'p-applicant-enter-your-date-of-birth',
            theme: 'applicant-details',
            format: {
                value: 'date-time',
                precision: 'YYYY-MM-DD'
            }
        };

        const mappedQuestion = mapApplicationQuestion(timestampQuestionData);
        expect(mappedQuestion.columnValue).toEqual('01-JAN-1970');
    });

    it('Should keep the value of applicant_expenses as true if its already populated as true', () => {
        const specialExpensesQuestionData = {
            theme: 'special-expenses',
            id: 'q-applicant-se-treatment',
            value: true
        };

        let mappedQuestion = mapApplicationQuestion(
            specialExpensesQuestionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnName).toBe('applicant_expenses');
        expect(mappedQuestion.columnValue).toBe('Y');

        specialExpensesQuestionData.value = false;
        applicationForm.applicant_expenses = true;
        mappedQuestion = mapApplicationQuestion(
            specialExpensesQuestionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnName).toBe('applicant_expenses');
        expect(mappedQuestion.columnValue).toBeTruthy();
    });

    it('Should return an address value and column for certain questions', () => {
        const addressQuestionData = {
            theme: 'treatment',
            id: 'q-gp-organisation-name',
            value: 'kfc'
        };

        const mappedQuestion = mapApplicationQuestion(addressQuestionData);
        expect(mappedQuestion.columnValue).toBe('kfc');
        expect(mappedQuestion.addressValue).toBe('kfc');
    });

    it('Should return a gp address value and column', () => {
        const addressQuestionData = {
            theme: 'treatment',
            id: 'q-gp-organisation-name',
            value: 'GP Surgery'
        };

        const mappedQuestion = mapApplicationQuestion(addressQuestionData);
        expect(mappedQuestion.columnValue).toBe('GP Surgery');
        expect(mappedQuestion.addressValue).toBe('GP Surgery');
    });

    it('Should map the application type', () => {
        const questionData = {
            theme: 'crime',
            id: 'q-applicant-did-the-crime-happen-once-or-over-time',
            value: 'once'
        };
        let mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue[0]).toBe(2);
        expect(mappedQuestion.columnValue[1]).toBe('N');
        expect(mappedQuestion.columnValue[2]).toBe('1');

        questionData.value = 'over-a-period-of-time';
        mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue[0]).toBe(3);
        expect(mappedQuestion.columnValue[1]).toBe('N');
        expect(mappedQuestion.columnValue[2]).toBe('0');
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
            id: 'q-applicant-physical-injuries',
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
        let mappedQuestion = mapApplicationQuestion(questionData, applicationForm, addressDetails);
        expect(mappedQuestion.columnValue).toBe('Miss');
        expect(mappedQuestion.addressValue).toBe('Miss');

        questionData.value = 'Sabina';
        addressDetails.push({
            address_type: 'APA',
            name: 'Miss'
        });
        mappedQuestion = mapApplicationQuestion(questionData, applicationForm, addressDetails);
        expect(mappedQuestion.addressValue).toBe('Miss Sabina');
    });

    it('Applicant first name should map to name and initials', () => {
        const questionData = {
            theme: 'applicant-details',
            id: 'q-applicant-first-name',
            value: 'Gary'
        };
        const mappedQuestion = mapApplicationQuestion(
            questionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnValue[0]).toBe('Gary');
        expect(mappedQuestion.columnValue[1]).toBe('G');
    });

    it('Should create an array of selected options for work details', () => {
        const questionData = {
            theme: 'impact',
            id: 'q-applicant-work-details-option',
            value: ['education', 'other']
        };

        const mappedQuestion = mapApplicationQuestion(
            questionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnValue).toContainEqual('E', 'O');
    });

    it('Should map when crime happened', () => {
        const questionData = {
            theme: 'impact',
            id: 'q-applicant-job-when-crime-happened',
            value: true
        };

        const mappedQuestion = mapApplicationQuestion(
            questionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnValue).toContainEqual('I');
    });

    it('Should map other physical injuries code', () => {
        const questionData = {
            theme: 'injuries',
            id: 'q-applicant-physical-injuries-upper-face-other',
            value: 'confetti'
        };

        let mappedQuestion = mapApplicationQuestion(questionData, applicationForm, addressDetails);
        expect(mappedQuestion.columnValue).toBe('phyinj-149');

        applicationForm.injury_details_code = 'phyinj-001:phyinj-027:phinj-727';
        mappedQuestion = mapApplicationQuestion(questionData, applicationForm, addressDetails);
        expect(mappedQuestion.columnValue).toBe('phyinj-001:phyinj-027:phinj-727:phyinj-149');

        questionData.id = 'q-applicant-physical-injuries-legs-hip-other';
        mappedQuestion = mapApplicationQuestion(questionData, applicationForm, addressDetails);
        expect(mappedQuestion.columnValue).toBe('phyinj-001:phyinj-027:phinj-727:phyinj-149');
    });

    it('Should map if the reporter was estranged from the victim', () => {
        const questionData = {
            theme: 'relationship-to-deceased',
            id: 'q-applicant-living-apart',
            value: true
        };

        let mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('Y');

        questionData.id = 'q-applicant-contact-with-deceased';
        questionData.value = 'test';
        mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('N');
    });

    it('Should map if the reporter was living with the deceased less than 2 years', () => {
        const questionData = {
            theme: 'relationship-to-deceased',
            id: 'q-applicant-living-together-duration',
            value: false
        };
        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('N');
    });

    it('Should map if the victim requires financial help', () => {
        const questionData = {
            theme: 'relationship-to-deceased',
            id: 'q-applicant-financial-help',
            value: true
        };

        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('Y');
    });

    it('Should map if the claim is fatality only', () => {
        const questionData = {
            theme: 'about-application',
            id: 'q-applicant-claim-type',
            value: false
        };

        const mappedQuestion = mapApplicationQuestion(
            questionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnValue).toContainEqual('FatalityOnly');
        expect(mappedQuestion.columnValue).toContainEqual(4);
        expect(mappedQuestion.columnValue).toContainEqual('0');
        expect(mappedQuestion.columnValue).toContainEqual('N');
    });

    it('Should map if the claim is funeral only', () => {
        const questionData = {
            theme: 'about-application',
            id: 'q-applicant-claim-type',
            value: true
        };

        applicationForm.split_funeral = true;

        const mappedQuestion = mapApplicationQuestion(
            questionData,
            applicationForm,
            addressDetails
        );
        expect(mappedQuestion.columnValue).toContainEqual('FuneralOnly');
        expect(mappedQuestion.columnValue).toContainEqual(7);
        expect(mappedQuestion.columnValue).toContainEqual('0');
    });

    it('Should map if the victim is capable correctly', () => {
        const questionData = {
            theme: 'applicant-details',
            id: 'q-applicant-capable',
            value: true
        };

        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('N');
    });

    describe('Address splitting when the crime happened outside the UK', () => {
        it('Should only return one address line when the value is less than 32 characters', () => {
            const questionData = {
                theme: 'crime',
                id: 'q-applicant-crime-location',
                value: 'Lorem ipsum'
            };
            const mappedQuestion = mapApplicationQuestion(questionData);
            expect(mappedQuestion.columnValue[0]).toBe('Lorem ipsum');
        });

        it('Should split the value into segments of 32 characters or less', () => {
            const questionData = {
                theme: 'crime',
                id: 'q-applicant-crime-location',
                value:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mi lorem, tincidunt ac sapien.'
            };
            const mappedQuestion = mapApplicationQuestion(questionData);
            mappedQuestion.columnValue.forEach(addressLine => {
                expect(addressLine.length).toBeLessThan(32);
            });
        });

        it('Should remove overflow data if the value is over 160 characters', () => {
            const questionData = {
                theme: 'crime',
                id: 'q-applicant-crime-location',
                value:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mi lorem, tincidunt ac sapien Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mi lorem, tincidunt ac sapien'
            };
            const mappedQuestion = mapApplicationQuestion(questionData);
            expect(mappedQuestion.columnValue.length).toBe(5);
        });

        it('Should generate a 32 character string if the 32nd character is a whitespace', () => {
            const questionData = {
                theme: 'crime',
                id: 'q-applicant-crime-location',
                value: '0123456789 123456789 123456789 1 abc dhd bin '
            };
            const mappedQuestion = mapApplicationQuestion(questionData);
            expect(mappedQuestion.columnValue.length).toBe(2);
            expect(mappedQuestion.columnValue[0].length).toBe(32);
        });

        it('Should map q-police-force-is to police_force and police_force_area', () => {
            const questionData = {
                theme: 'crime',
                id: 'q-police-force-id',
                value: '10002424'
            };
            const mappedQuestion = mapApplicationQuestion(
                questionData,
                applicationForm,
                addressDetails
            );
            expect(mappedQuestion.columnValue).toEqual(['10002424', '10002424']);
        });
    });

    it('Should map who the crime was reported to', () => {
        const questionData = {
            theme: 'about-application',
            id: 'q--was-the-crime-reported-to-police',
            value: true
        };

        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue[0]).toBe('Y');
        expect(mappedQuestion.columnValue[1]).toBe('Police');
    });

    it('Should map multiple incident types', () => {
        const physicalInjuryData = {
            theme: 'crime',
            id: 'q-applicant-incident-type',
            value: ['PHYS', 'FMLY', 'AORV']
        };
        const mappedQuestion = mapApplicationQuestion(physicalInjuryData);
        expect(mappedQuestion.columnValue).toBe('PHYS,FMLY,AORV');
    });

    it('Should map a single incident type', () => {
        const physicalInjuryData = {
            theme: 'crime',
            id: 'q-applicant-incident-type',
            value: ['OTHER']
        };
        const mappedQuestion = mapApplicationQuestion(physicalInjuryData);
        expect(mappedQuestion.columnValue).toBe('OTHER');
    });

    it('Should map legacy incident types', () => {
        const physicalInjuryData = {
            theme: 'crime',
            id: 'q-applicant-incident-type',
            value: 'OTHER'
        };
        const mappedQuestion = mapApplicationQuestion(physicalInjuryData);
        expect(mappedQuestion.columnValue).toBe('OTHER');
    });

    it('Should map which other compensation a claimant applied for', () => {
        const questionData = {
            theme: 'other-compensation',
            id: 'q-applicant-who-did-you-apply-to',
            value: 'I applied to someone else'
        };
        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('I applied to someone else');
    });

    it('Should map how much other compensation a claimant was awarded', () => {
        const questionData = {
            theme: 'other-compensation',
            id: 'q-how-much-was-award',
            value: '300'
        };
        const mappedQuestion = mapApplicationQuestion(questionData);
        expect(mappedQuestion.columnValue).toBe('300');
    });
});
