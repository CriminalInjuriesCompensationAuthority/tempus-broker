'use strict';

const {DateTime} = require('luxon');
const ApplicationType = require('../../constants/application-type');

// Takes an application form json and checks for eligibility
function checkGeneralEligibilityRules(dbApplicationForm) {
    const dateTimePolFirstTold = dbApplicationForm?.date_time_pol_first_told
        ? DateTime.fromFormat(dbApplicationForm?.date_time_pol_first_told, 'dd-MMM-yyyy')
        : null;
    const dateTimeOfIncident = dbApplicationForm?.date_time_of_incident
        ? DateTime.fromFormat(dbApplicationForm?.date_time_of_incident, 'dd-MMM-yyyy')
        : null;
    const dateTimeOfIncidentTo = dbApplicationForm?.date_time_of_incident_to
        ? DateTime.fromFormat(dbApplicationForm?.date_time_of_incident_to, 'dd-MMM-yyyy')
        : null;
    const submittedDate = DateTime.fromFormat(dbApplicationForm?.created_date, 'dd-MMM-yyyy');
    const applicationType = dbApplicationForm?.application_type;
    const dateOfBirth = DateTime.fromFormat(dbApplicationForm?.date_of_birth, 'dd-MMM-yyyy');

    // ------------- Business rules -------------
    // 1. The crime must be reported to the police
    const notReportedToPolice = dbApplicationForm?.incident_rep_police === 'N';
    // 2. The applicant is not a victim of human trafficking and not seeking asylum
    const traffickedAndSeekingAsylum =
        dbApplicationForm?.residency_09 === 'N' && dbApplicationForm?.residency_10 === 'N';
    let reportedTooLate;
    if (applicationType === ApplicationType.PERIOD_OF_ABUSE) {
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

    // 4. The crime happened (if PI/Fatality) or stopped (if POA) 2 years before the user is submitting, and the user was over 20 years old at time of submission
    const reportedAfterTwoYears =
        dateTimeOfIncident &&
        submittedDate.diff(dateTimeOfIncident, 'days').toObject().days > 730 &&
        submittedDate.diff(dateOfBirth, 'years').toObject().years > 20;

    // 5. The crime did not happen in England, Scotland or Wales
    const ineligibleLocation = dbApplicationForm?.incident_country === 'somewhere-else';

    // 7. The applicant is ineligible if they were not in contact with the deceased
    const estrangedFromDeceased = dbApplicationForm?.estranged_from_deceased === 'Y';

    // 9. The applicant is ineligible if they are not related to the victim and they are not paying for funeral costs
    const unrelatedAndNoFuneralCosts =
        dbApplicationForm?.relationship_to_deceased === 'other' &&
        dbApplicationForm?.funeral_claim === 'N';

    // 10. The applicant is ineligible if the incident type only contains other
    // We skip this check if the claim is a fatality
    let onlyOtherIncidentType = false;
    if (
        applicationType === ApplicationType.PERSONAL_INJURY ||
        applicationType === ApplicationType.PERIOD_OF_ABUSE
    ) {
        onlyOtherIncidentType =
            dbApplicationForm?.pi_type_cause === 'OTHER' &&
            dbApplicationForm?.pi_type_cause_other !== undefined;
    }

    if (
        notReportedToPolice ||
        traffickedAndSeekingAsylum ||
        reportedTooLate ||
        reportedAfterTwoYears ||
        ineligibleLocation ||
        estrangedFromDeceased ||
        unrelatedAndNoFuneralCosts ||
        onlyOtherIncidentType
    ) {
        return false;
    }

    return true;
}

module.exports = checkGeneralEligibilityRules;
