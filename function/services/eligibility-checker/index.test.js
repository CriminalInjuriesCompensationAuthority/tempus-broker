'use strict';

const checkEligibility = require('.');

// original eligibilty check does not care about the applicationData
const emptyApplicationData = {};

describe('checkEligibility', () => {
    it('Should be eligible when all checks pass', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '17-FEB-2023',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-2023',
            date_time_pol_first_told: '16-FEB-2023',
            date_time_of_incident_to: '15-FEB-2023',
            incident_country: 'england',
            injury_details_code: 'phyinj-048:phyinj-001:phyinj-149',
            estranged_from_deceased: 'N',
            relationship_to_deceased: 'parent',
            pi_type_cause: 'PHYS,OTHER',
            pi_type_cause_other: 'other',
            date_of_birth: '01-JAN-2000'
        };

        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should skip injury checking when claim is a fatality', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 4,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-2022',
            date_time_pol_first_told: '16-FEB-2022',
            date_time_of_incident_to: '10-JAN-2023',
            incident_country: 'england',
            injury_details_code: 'phyinj-149',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should skip checking for no injuries when the claim is a fatality', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 4,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-2022',
            date_time_pol_first_told: '16-FEB-2022',
            date_time_of_incident_to: '10-JAN-2023',
            incident_country: 'england',
            injury_details_code: 'phyinj-149',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be ineligible when the crime was not reported', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            incident_rep_police: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible when the human trafficking and asylum application are both false', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2023',
            is_eligible: 'Y',
            residency_09: 'N',
            residency_10: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible when the crime was reported 48 hours after the crime happened', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2023',
            is_eligible: 'Y',
            date_time_of_incident: '15-FEB-2022',
            date_time_pol_first_told: '18-FEB-2022',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the crime happened 2 years before the submitted date', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '28-APR-2024',
            is_eligible: 'Y',
            date_time_of_incident: '03-JAN-2000',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be eligible if the crime happened 2 years before the submitted date but the applicant is under 20 years old', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '28-APR-2024',
            is_eligible: 'Y',
            date_time_of_incident: '03-JAN-2015',
            date_of_birth: '01-JAN-2015'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be ineligible if the crime did not happen in Scotland, England or Wales', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            incident_country: 'somewhere-else',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if all the injury codes are ineligible and there was no DMI', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            injury_details_code: 'phyinj-149:phyinj-044:phyinj-048',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be eligible if all the injury codes are ineligible but a DMI lasted 6 or more weeks', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            injury_details_code: 'phyinj-149:phyinj-044:phyinj-048',
            dmi_gt_6_weeks: 'Y',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be eligible if all the injury codes are ineligible, a DMI lasted for less than 6 weeks but it is still ongoing', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            injury_details_code: 'phyinj-149:phyinj-044:phyinj-048',
            dmi_gt_6_weeks: 'N',
            DMI_ONGOING: 'Y',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be ineligible if the applicant and deceased were estranged', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            estranged_from_deceased: 'Y',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the applicant had no injuries', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the applicant had no injuries and a DMI that lasted less than 6 weeks and is not ongoing', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'Y',
            dmi_gt_6_weeks: 'N',
            DMI_ONGOING: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be eligible if the applicant had no injuries and a DMI that lasted less than 6 weeks and is ongoing', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'Y',
            dmi_gt_6_weeks: 'N',
            DMI_ONGOING: 'Y',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be eligible if the applicant had no injuries and a DMI that lasted more than 6 weeks', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'ASST',
            physical_injuries: 'N',
            loss_of_foetus: 'N',
            infections: 'N',
            dmi: 'Y',
            dmi_gt_6_weeks: 'Y',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it('Should be ineligible if the applicant was an other relation to the victim and did not pay for the funeral', () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            relationship_to_deceased: 'other',
            funeral_claim: 'N',
            date_of_birth: '01-JAN-2000'
        };
        checkEligibility(emptyApplicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if applicant previously applied', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '17-FEB-2023',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-2023',
            date_time_pol_first_told: '16-FEB-2023',
            date_time_of_incident_to: '15-FEB-2023',
            incident_country: 'england',
            injury_details_code: 'phyinj-048:phyinj-001:phyinj-149',
            estranged_from_deceased: 'N',
            relationship_to_deceased: 'parent',
            date_of_birth: '01-JAN-2000'
        };

        const applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: true,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };

        checkEligibility(applicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be eligible if applicant has not previously applied', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '17-FEB-2023',
            is_eligible: 'Y',
            incident_rep_police: 'Y',
            residency_09: 'Y',
            residency_10: 'N',
            date_time_of_incident: '15-FEB-2023',
            date_time_pol_first_told: '16-FEB-2023',
            date_time_of_incident_to: '15-FEB-2023',
            incident_country: 'england',
            injury_details_code: 'phyinj-048:phyinj-001:phyinj-149',
            estranged_from_deceased: 'N',
            relationship_to_deceased: 'parent',
            date_of_birth: '01-JAN-2000'
        };

        const applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: false,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };

        checkEligibility(applicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });

    it(`Should be ineligible if the applicant was an other relation to the victim
         and did not pay for the funeral and has not previously applied`, () => {
        const applicationObject = {
            case_reference_number: '027906',
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            relationship_to_deceased: 'other',
            funeral_claim: 'N',
            date_of_birth: '01-JAN-2000'
        };

        const applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: false,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };
        checkEligibility(applicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be ineligible if the applicant only selected OTHER as incident type', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'OTHER',
            pi_type_cause_other: 'other',
            date_of_birth: '01-JAN-2000'
        };

        const applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: false,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };
        checkEligibility(applicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('N');
    });

    it('Should be eligible if the applicant did not select OTHER as incident type', () => {
        const applicationObject = {
            case_reference_number: '027906',
            application_type: 2,
            created_date: '02-JAN-2022',
            is_eligible: 'Y',
            pi_type_cause: 'PHYS,FMLY,AORV',
            date_of_birth: '01-JAN-2000'
        };

        const applicationData = {
            meta: {
                caseReference: '23\\327507',
                submittedDate: '2023-05-19T13:06:12.693Z',
                splitFuneral: false
            },
            themes: [
                {
                    type: 'theme',
                    id: 'about-application',
                    title: 'About your application',
                    values: [
                        {
                            id: 'q-applicant-applied-before-for-this-crime',
                            type: 'simple',
                            value: false,
                            theme: 'about-application'
                        }
                    ]
                }
            ]
        };
        checkEligibility(applicationData, applicationObject);
        expect(applicationObject.is_eligible).toBe('Y');
    });
});
