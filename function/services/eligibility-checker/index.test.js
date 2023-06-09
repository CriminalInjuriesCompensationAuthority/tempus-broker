'use strict';

const checkEligibility = require('.');

describe('Eligibility checker', () => {
    it('Should be eligible when all checks pass', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_9: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-22',
            date_time_pol_first_told: '16-FEB-22',
            date_time_of_incident_to: '10-JAN-23',
            incident_country: 'england',
            injury_details_code: 'phyinj-048:phyinj-001:phyinj-149'
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
            residency_9: 'N',
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

    it('Should be ineligible when the crime happened 2 years after the submitted date', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            date_time_of_incident: '03-JAN-24'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible when the crime stopped 2 years after the submitted date', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            date_time_of_incident_to: '03-JAN-24'
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
            created_date: '02-JAN-22',
            is_eligible: 'Y',
            injury_details_code: 'phyinj-149:phyinj-044:phyinj-048'
        };
        const checkedApplicationObject = checkEligibility(applicationObject);
        expect(checkedApplicationObject.is_eligible).toBe('N');
    });
});
