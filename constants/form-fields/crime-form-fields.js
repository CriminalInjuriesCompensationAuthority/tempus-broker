'use strict';

module.exports = Object.freeze({
    date_time_of_incident: 'q-applicant-when-did-the-crime-happen',
    date_time_pol_first_told: 'q--when-was-the-crime-reported-to-police',
    application_type: 'q-applicant-did-the-crime-happen-once-or-over-time',
    crime_ref_no: 'q--whats-the-crime-reference-number',
    incident_country: 'q-applicant-where-did-the-crime-happen',
    address_line_1: [
        'q-applicant-scottish-location',
        'q-applicant-english-location',
        'q-applicant-welsh-location'
    ],
    address_line_4: [
        'q-applicant-scottish-town-or-city',
        'q-applicant-english-town-or-city',
        'q-applicant-welsh-town-or-city'
    ],
    police_force_area: 'q-police-force-id'
});
