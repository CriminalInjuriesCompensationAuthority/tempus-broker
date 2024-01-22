'use strict';

const fs = require('fs');
const mapApplicationDataToOracleObject = require('./index');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');
const getApplicationFormDefault = require('../../constants/application-form-default');
const getAddressDetailsDefault = require('../../constants/address-details-default');

describe('Application mapper', () => {
    let applicationSummaryJson;
    let oracleObject;
    let applicationFormJson;
    let addressDetailsJson;
    let applicationFormDefault = getApplicationFormDefault();
    let addressDetailsDefault = getAddressDetailsDefault();

    beforeEach(() => {
        applicationSummaryJson = null;
        oracleObject = null;
        applicationFormJson = null;
        addressDetailsJson = null;
        applicationFormDefault = getApplicationFormDefault();
        addressDetailsDefault = getAddressDetailsDefault();
    });

    it('Should set the CRN and Submitted date', async () => {
        applicationSummaryJson = fs.readFileSync(
            'function/resources/testing/application-meta.json'
        );
        oracleObject = await mapApplicationDataToOracleObject(
            JSON.parse(applicationSummaryJson),
            applicationFormDefault,
            addressDetailsDefault
        );
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

        expect(applicationFormJson.claim_reference_number).toEqual('207906');
        expect(applicationFormJson.ref_year).toEqual('44');
        expect(applicationFormJson.created_date).toEqual('19-MAY-2023');
        expect(applicationFormJson.split_funeral).toBeTruthy();
    });

    describe('Set the channel column with the application source', () => {
        it('Should default channel column to "W" if not value is provided', async () =>{
            applicationSummaryJson = fs.readFileSync(
                'function/resources/testing/application-meta.json'
            );
            oracleObject = await mapApplicationDataToOracleObject(
                JSON.parse(applicationSummaryJson),
                applicationFormDefault,
                addressDetailsDefault
            );
            applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

            expect(applicationFormJson.channel).toEqual('W');
        });

        it('Should set channel column to "W" if ownerOrigin is a web application', async () =>{
            applicationSummaryJson = fs.readFileSync(
                'function/resources/testing/application-meta-web-app.json'
            );
            oracleObject = await mapApplicationDataToOracleObject(
                JSON.parse(applicationSummaryJson),
                applicationFormDefault,
                addressDetailsDefault
            );
            applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

            expect(applicationFormJson.channel).toEqual('W');
        });

        it('Should set channel column to "T" if ownerOrigin is a telephone application', async () =>{
            applicationSummaryJson = fs.readFileSync(
                'function/resources/testing/application-meta-telephone-app.json'
            );
            oracleObject = await mapApplicationDataToOracleObject(
                JSON.parse(applicationSummaryJson),
                applicationFormDefault,
                addressDetailsDefault
            );
            applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

            expect(applicationFormJson.channel).toEqual('T');
        });
    });

    it('Should map an application question to application_form', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-british-citizen-or-eu-national',
            theme: 'about-application',
            value: 'British Citizen'
        };

        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );
        const formField =
            FormFieldsGroupedByTheme[applicationSummaryJson.theme]?.[applicationSummaryJson.id];
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;
        expect(Object.keys(applicationFormJson).find(key => key === formField)).toBeTruthy();
        expect(applicationFormJson[formField]).toContain(applicationSummaryJson.value);
    });

    it('Should map an application question to address_details', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-english-town-or-city',
            theme: 'crime',
            value: 'Manchester'
        };

        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );
        const formField =
            FormFieldsGroupedByTheme[applicationSummaryJson.theme]?.[applicationSummaryJson.id];

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        expect(Object.hasOwn(addressDetailsJson[0], formField)).toBeTruthy();
        expect(addressDetailsJson[0][formField]).toContain(applicationSummaryJson.value);
    });

    it('Should add a new entry in address_details if the address type is new', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-english-town-or-city',
            theme: 'crime',
            value: 'Manchester'
        };

        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );
        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        expect(addressDetailsJson.length).toBe(1);

        applicationSummaryJson = {
            id: 'q-gp-organisation-name',
            theme: 'treatment',
            value: 'cat'
        };
        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsJson
        );
        expect(addressDetailsJson.length).toBe(2);
    });

    it('Should add the crn and ref year for each entry in address_details', async () => {
        applicationSummaryJson = {
            meta: {
                caseReference: '44\\207906',
                submittedDate: '2023-05-19T13:06:12.693Z'
            },
            values: [
                {
                    id: 'q-applicant-english-town-or-city',
                    theme: 'crime',
                    value: 'Manchester'
                },
                {
                    id: 'q-gp-organisation-name',
                    theme: 'treatment',
                    value: 'cat'
                }
            ]
        };
        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        addressDetailsJson.forEach(entry => {
            expect(entry?.claim_reference_number).toBeTruthy();
            expect(entry?.ref_year).toBeTruthy();
        });
    });

    it('Should populate application_form.rep_organisation with the address name if type is RPA', async () => {
        applicationSummaryJson = {
            values: [
                {
                    id: 'q-rep-organisation-name',
                    theme: 'rep-details',
                    value: 'Cat'
                },
                {
                    id: 'q-rep-title',
                    theme: 'rep-details',
                    value: 'Mr'
                },
                {
                    id: 'q-rep-first-name',
                    theme: 'rep-details',
                    value: 'Neko'
                },
                {
                    id: 'q-rep-last-name',
                    theme: 'rep-details',
                    value: 'Noches'
                }
            ]
        };
        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;
        addressDetailsJson.forEach(entry => {
            if (entry?.address_type === 'RPA') {
                expect(entry?.name).toBe('Cat, Mr N Noches');
            }
        });
        expect(applicationFormJson?.rep_organisation).toBe('Cat, Mr N Noches');
    });

    it('Should trim characters after 70 for concatenated values', async () => {
        applicationSummaryJson = {
            values: [
                {
                    id: 'q-rep-organisation-name',
                    theme: 'rep-details',
                    value: 'The super long representative organisation of crime and other things'
                },
                {
                    id: 'q-rep-title',
                    theme: 'rep-details',
                    value: 'Mr'
                },
                {
                    id: 'q-rep-first-name',
                    theme: 'rep-details',
                    value: 'Neko'
                },
                {
                    id: 'q-rep-last-name',
                    theme: 'rep-details',
                    value: 'Ihavealongsurname'
                }
            ]
        };
        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

        const trimmedConcat =
            'The super long representative organisation of crime and other things, ';

        addressDetailsJson.forEach(entry => {
            if (entry?.address_type === 'RPA') {
                expect(entry?.name).toBe(trimmedConcat);
            }
        });

        expect(applicationFormJson?.rep_organisation).toBe(trimmedConcat);
    });

    it('Should add an entry to both address_details and application_form for some ids', async () => {
        applicationSummaryJson = {
            id: 'q-mainapplicant-title',
            theme: 'main-applicant-details',
            value: 'mister'
        };
        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );
        const formField =
            FormFieldsGroupedByTheme[applicationSummaryJson.theme]?.[applicationSummaryJson.id];
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;
        expect(applicationFormJson[formField]).toBe(applicationSummaryJson.value);
        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        addressDetailsJson.forEach((entry, i) => {
            if (entry?.name && addressDetailsJson[i] === 'PAB') {
                expect(entry.name).toBe(applicationSummaryJson.value);
            }
        });
    });

    it('Should map an array of address details to an array of columns', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-crime-location',
            theme: 'crime',
            value: 'Should map an array of address details to an array of columns'
        };

        oracleObject = await mapApplicationDataToOracleObject(
            applicationSummaryJson,
            applicationFormDefault,
            addressDetailsDefault
        );
        const formField =
            FormFieldsGroupedByTheme[applicationSummaryJson.theme]?.[applicationSummaryJson.id];
        expect(Array.isArray(formField)).toBeTruthy();

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        expect(Object.hasOwn(addressDetailsJson[0], formField[0])).toBeTruthy();
        expect(addressDetailsJson[0][formField[0]]).toContain('Should');
    });
});
