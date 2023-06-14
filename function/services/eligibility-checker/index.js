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
        applicationFormJson?.incident_rep_police === 'N' ||
        (applicationFormJson?.residency_9 === 'N' && applicationFormJson?.residency_10 === 'N') ||
        // 48 hours in minutes
        (dateTimePolFirstTold &&
            dateTimeOfIncident &&
            dateTimePolFirstTold.diff(dateTimeOfIncident, 'minutes').toObject().minutes > 2880) ||
        // 2 years in minutes
        (dateTimeOfIncident &&
            dateTimeOfIncident.diff(submittedDate, 'minutes').toObject().minutes > 1051899) ||
        (dateTimeOfIncidentTo &&
            dateTimeOfIncidentTo.diff(submittedDate, 'minutes').toObject().minutes > 1051899) ||
        applicationFormJson?.incident_country === 'somewhere-else' ||
        ineligibleDueToInjuries
    ) {
        checkedApplicationFormJson.is_eligible = 'N';
    }

    return checkedApplicationFormJson;
}

module.exports = checkEligibility;
