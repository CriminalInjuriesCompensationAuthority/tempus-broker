'use strict';

const {DateTime} = require('luxon');
const invalidInjuryCodes = require('../../constants/ineligible-injury-codes');

// Takes an application form json and checks for eligibility
function checkEligibility(applicationFormJson) {
    const checkedApplicationFormJson = applicationFormJson;
    const dateTimePolFirstTold = applicationFormJson?.date_time_pol_first_told
        ? DateTime.fromFormat(applicationFormJson?.date_time_pol_first_told, 'dd-MMM-yyyy')
        : null;
    const dateTimeOfIncident = applicationFormJson?.date_time_of_incident
        ? DateTime.fromFormat(applicationFormJson?.date_time_of_incident, 'dd-MMM-yyyy')
        : null;
    const dateTimeOfIncidentTo = applicationFormJson?.date_time_of_incident_to
        ? DateTime.fromFormat(applicationFormJson?.date_time_of_incident_to, 'dd-MMM-yyyy')
        : null;
    const submittedDate = DateTime.fromFormat(applicationFormJson?.created_date, 'dd-MMM-yyyy');
    const applicationType = applicationFormJson?.application_type;

    // ------------- Business rules -------------
    // 1. The crime must be reported to the police
    const notReportedToPolice = applicationFormJson?.incident_rep_police === 'N';
    // 2. The applicant is not a victim of human trafficking and not seeking asylum
    const traffickedAndSeekingAsylum =
        applicationFormJson?.residency_09 === 'N' && applicationFormJson?.residency_10 === 'N';
    let reportedTooLate;
    if (applicationType === 3) {
        // 3. The crime was reported 48 hours after the crime happened or stopped
        reportedTooLate =
            dateTimePolFirstTold &&
            dateTimeOfIncidentTo &&
            dateTimePolFirstTold.diff(dateTimeOfIncidentTo, 'minutes').toObject().minutes > 2880;
    } else {
        // 3. The crime was reported 48 hours after the crime happened or stopped
        reportedTooLate =
            dateTimePolFirstTold &&
            dateTimeOfIncident &&
            dateTimePolFirstTold.diff(dateTimeOfIncident, 'minutes').toObject().minutes > 2880;
    }

    // 4. The crime happened (if PI/Fatality) or stopped (if POA) 2 years before the user is submitting
    const reportedAfterTwoYears =
        dateTimeOfIncident && submittedDate.diff(dateTimeOfIncident, 'days').toObject().days > 730;

    // 5. The crime did not happen in England, Scotland or Wales
    const ineligibleLocation = applicationFormJson?.incident_country === 'somewhere-else';
    // 6. The applicant is ineligible if only claiming for certain injuries
    // We skip this check if the claim is a fatality
    let ineligibleDueToInjuries = false;
    if (
        applicationFormJson?.injury_details_code &&
        (applicationType === 2 || applicationType === 3)
    ) {
        ineligibleDueToInjuries = true;
        const injuryCodes = applicationFormJson.injury_details_code.split(':');
        injuryCodes.forEach(code => {
            if (!invalidInjuryCodes.includes(code)) {
                ineligibleDueToInjuries = false;
            }
        });
    }
    // 7. The applicant is ineligible if they were not in contact with the deceased
    const estrangedFromDeceased = applicationFormJson?.estranged_from_deceased === 'Y';

    // 8. The applicant is ineligible if they didn't have any injuries
    // We skip this check if the claim is a fatality
    let noInjuries = false;
    if (applicationType === 2 || applicationType === 3) {
        noInjuries =
            applicationFormJson?.pi_type_cause !== 'SEX' &&
            applicationFormJson?.physical_injuries === 'N' &&
            applicationFormJson?.loss_of_foetus === 'N' &&
            applicationFormJson?.infections === 'N' &&
            applicationFormJson?.dmi === 'N';
    }

    // 9. The applicant is ineligible if they are not related to the victim and they are not paying for funeral costs
    const unrelatedAndNoFuneralCosts =  applicationFormJson?.relationship_to_deceased==='other' && applicationFormJson?.funeral_claim==='N'

    if (
        notReportedToPolice ||
        traffickedAndSeekingAsylum ||
        reportedTooLate ||
        reportedAfterTwoYears ||
        ineligibleLocation ||
        ineligibleDueToInjuries ||
        estrangedFromDeceased ||
        noInjuries ||
        unrelatedAndNoFuneralCosts
    ) {
        checkedApplicationFormJson.is_eligible = 'N';
    }

    return checkedApplicationFormJson;
}

module.exports = checkEligibility;
