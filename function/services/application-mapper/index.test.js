'use strict';

const fs = require('fs');
const mapApplicationDataToOracleObject = require('./index');
const FormFieldsGroupedByTheme = require('../../constants/form-fields-grouped-by-theme');

describe('Application mapper', () => {
    let applicationSummaryJson;
    let oracleObject;
    let applicationFormJson;
    let addressDetailsJson;

    beforeEach(() => {
        applicationSummaryJson = null;
        oracleObject = null;
        applicationFormJson = null;
        addressDetailsJson = null;
    });

    it('Should set the CRN and Submitted date', async () => {
        applicationSummaryJson = fs.readFileSync(
            'function/resources/testing/application-meta.json'
        );
        oracleObject = await mapApplicationDataToOracleObject(JSON.parse(applicationSummaryJson));
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;

        expect(applicationFormJson.claim_reference_number).toEqual('207906');
        expect(applicationFormJson.ref_year).toEqual('44');
        expect(applicationFormJson.created_date).toEqual('19-MAY-23');
    });

    it('Should map an application question to application_form', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-british-citizen-or-eu-national',
            theme: 'about-application',
            value: 'British Citizen'
        };

        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);
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

        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);
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

        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);
        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        expect(addressDetailsJson.length).toBe(1);

        applicationSummaryJson = {
            id: 'q-gp-organisation-name',
            theme: 'treatment',
            value: 'cat'
        };
        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);
        expect(addressDetailsJson.length).toBe(2);
    });

    it('Should add the crn and ref year for each entry in address_details', async () => {
        applicationSummaryJson = {
            id: 'q-applicant-english-town-or-city',
            theme: 'crime',
            value: 'Manchester'
        };
        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);

        applicationSummaryJson = {
            id: 'q-gp-organisation-name',
            theme: 'treatment',
            value: 'cat'
        };
        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);

        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        addressDetailsJson.forEach(entry => {
            expect(Object.hasOwn(entry, 'claim_reference_number')).toBeTruthy();
            expect(Object.hasOwn(entry, 'ref_year')).toBeTruthy();
        });
    });

    it('Should add an entry to both address_details and application_form for some ids', async () => {
        applicationSummaryJson = {
            id: 'q-mainapplicant-title',
            theme: 'main-applicant-details',
            value: 'mister'
        };
        oracleObject = await mapApplicationDataToOracleObject(applicationSummaryJson);
        const formField =
            FormFieldsGroupedByTheme[applicationSummaryJson.theme]?.[applicationSummaryJson.id];
        applicationFormJson = Object.values(oracleObject)[0][0].APPLICATION_FORM;
        expect(applicationFormJson[formField]).toBe(applicationSummaryJson.value);
        addressDetailsJson = Object.values(oracleObject)[0][1].ADDRESS_DETAILS;
        addressDetailsJson.forEach((entry, i) => {
            if (Object.hasOwn(entry, 'name') && addressDetailsJson[i] === 'PAB') {
                expect(entry.name).toBe(applicationSummaryJson.value);
            }
        });
    });
});
