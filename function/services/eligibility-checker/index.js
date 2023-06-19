'use strict';

const {DateTime} = require('luxon');
const invalidInjuryCodes = require('../../constants/ineligible-injury-codes');

// Takes an application form json and checks for eligibility
function checkEligibility(applicationFormJson) {
    const checkedApplicationFormJson = applicationFormJson;
    const dateTimePolFirstTold = applicationFormJson?.date_time_pol_first_told
        ? DateTime.fromFormat(applicationFormJson?.date_time_pol_first_told, 'dd-MMM-yy')
        : null;
    const dateTimeOfIncident = applicationFormJson?.date_time_of_incident
        ? DateTime.fromFormat(applicationFormJson?.date_time_of_incident, 'dd-MMM-yy')
        : null;
    const dateTimeOfIncidentTo = applicationFormJson?.date_time_of_incident_to
        ? DateTime.fromFormat(applicationFormJson?.date_time_of_incident_to, 'dd-MMM-yy')
        : null;
    const submittedDate = DateTime.fromFormat(applicationFormJson?.created_date, 'dd-MMM-yy');

    // ------------- Business rules -------------
    // 1. The crime must be reported to the police
    const reportedToPolice = applicationFormJson?.incident_rep_police === 'N';
    // 2. The applicant is not a victim of human trafficking and not seeking asylum
    const traffickedAndSeekingAsylum =
        applicationFormJson?.residency_9 === 'N' && applicationFormJson?.residency_10 === 'N';
    // 3. The crime was reported 48 hours after the crime happened or started
    const reportedOnTime =
        dateTimePolFirstTold &&
        dateTimeOfIncident &&
        dateTimePolFirstTold.diff(dateTimeOfIncident, 'minutes').toObject().minutes > 2880;
    // 4. The crime happened 2 years before the user is submitting
    const reportedWithinTwoYearsPI =
        dateTimeOfIncident &&
        dateTimeOfIncident.diff(submittedDate, 'minutes').toObject().minutes > 1051899;
    // 5. The crime stopped occuring 2 years before the user is submitting
    const reportedWithinTwoYearsPOA =
        dateTimeOfIncidentTo &&
        dateTimeOfIncidentTo.diff(submittedDate, 'minutes').toObject().minutes > 1051899;
    // 6. The crime did not happen in England, Scotland or Wales
    const ineligibleLocation = applicationFormJson?.incident_country === 'somewhere-else';
    // 7. The applicant is ineligible if only claiming for certain injuries
    let ineligibleDueToInjuries = true;
    if (applicationFormJson?.injury_details_code) {
        const injuryCodes = applicationFormJson.injury_details_code.split(':');
        injuryCodes.forEach(code => {
            if (!invalidInjuryCodes.includes(code)) {
                ineligibleDueToInjuries = false;
            }
        });
    }
    if (
        reportedToPolice ||
        traffickedAndSeekingAsylum ||
        reportedOnTime ||
        reportedWithinTwoYearsPI ||
        reportedWithinTwoYearsPOA ||
        ineligibleLocation ||
        ineligibleDueToInjuries
    ) {
        checkedApplicationFormJson.is_eligible = 'N';
    }

    return checkedApplicationFormJson;
}

module.exports = checkEligibility;
