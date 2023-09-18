'use strict';

const checkEligibility = require('.');

describe('Eligibility checker', () => {
    it('Should be eligible when all checks pass', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '17-FEB-23',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-23',
            date_time_pol_first_told: '16-FEB-23',
            date_time_of_incident_to: '15-FEB-23',
            incident_country: 'england',
            injury_details_code: 'phyinj-048:phyinj-001:phyinj-149',
            estranged_from_deceased: 'N'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('Y');
    });

    it('Should skip injury checking when claim is a fatality', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 4,
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-22',
            date_time_pol_first_told: '16-FEB-22',
            date_time_of_incident_to: '10-JAN-23',
            incident_country: 'england',
            injury_details_code: 'phyinj-149'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('Y');
    });

    it('Should skip checking for no injuries when the claim is a fatality', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 4,
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-22',
            date_time_pol_first_told: '16-FEB-22',
            date_time_of_incident_to: '10-JAN-23',
            incident_country: 'england',
            injury_details_code: 'phyinj-149',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'N'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('Y');
    });

    it('Should be ineligible when the crime was not reported', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            incident_rep_police: 'N'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible when the human trafficiking and asylum application are both false', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-23',
            is_eligible: 'Y',
            residency_09: 'N',
            residency_10: 'N'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible when the crime was reported 48 hours after the crime happened', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-23',
            is_eligible: 'Y',
            date_time_of_incident: '15-FEB-22',
            date_time_pol_first_told: '18-FEB-22'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the crime happened 2 years before the submitted date', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '28-APR-24',
            is_eligible: 'Y',
            date_time_of_incident: '03-JAN-00'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the crime did not happen in Scotland, England or Wales', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            incident_country: 'somewhere-else'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if all the injury codes are ineligible', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            injury_details_code: 'phyinj-149:phyinj-044:phyinj-048'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the applicant and deceased were estranged', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            estranged_from_deceased: 'Y'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the applicant had no injuries', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: '2',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'N'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });
});
