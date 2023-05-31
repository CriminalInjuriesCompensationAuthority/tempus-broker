'use strict';

module.exports = Object.freeze({
    'about-application': {
        incident_rep_police: 'q--was-the-crime-reported-to-police',
        is_injured_person: 'q-applicant-who-are-you-applying-for',
        residency_02: 'q-applicant-british-citizen-or-eu-national'
    },
    'applicant-details': {
        other_names: 'q-applicant-what-other-names-have-you-used',
        date_of_birth: 'q-applicant-enter-your-date-of-birth',
        claimant_email_address: 'q-applicant-enter-your-email-address',
        day_phone: 'q-applicant-enter-your-telephone-number',
        incident_delay_reason_code:
            'q-applicant-select-reasons-for-the-delay-in-making-your-application'
    },
    crime: {
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
    },
    impact: {
        earn_lost_gt_28_weeks: 'q-applicant-unable-to-work-duration',
        work_situation: ['q-applicant-work-details-option', 'q-applicant-job-when-crime-happened'],
        unable_to_work: 'q-applicant-unable-to-work',
        work_situation_other: 'q-applicant-work-details-other',
        affect_daily_capacity: 'q-applicant-affected-daily-capacity',
        affect_gt_28_weeks: 'q-applicant-affect-duration',
        affect_future_gt_28_weeks: 'q-applicant-affect-future-duration',
        future_work: 'q-applicant-future-work'
    },
    injuries: {
        infections: 'q-applicant-infections',
        physical_injuries: 'q-applicant-are-you-claiming-for-physical-injuries',
        injury_details_code: 'q-applicant-physical-injury'
    },
    'mental-health': {
        dmi: 'q-applicant-do-you-have-disabling-mental-injury',
        dmi_gt_6_weeks: 'q-applicant-mental-injury-duration'
    },
    offender: {
        assailant_identified: 'q-offender-do-you-know-the-name-of-the-offender',
        name_of_perpetrator: 'q-offender-enter-offenders-name'
    },
    'other-compensation': {
        previous_application_submitted: 'q-applicant-have-you-applied-to-us-before',
        prev_case_ref_num_01: 'q-enter-your-previous-reference-number',
        claimed_other_compensation:
            'q-applicant-have-you-applied-for-or-received-any-other-compensation',
        why_no_other_compensation:
            'q-applicant-applied-for-other-compensation-briefly-explain-why-not'
    },
    pregnancy: {pregnancy: 'q-applicant-pregnancy', loss_of_foetus: 'q-applicant-pregnancy-loss'},
    treatement: {
        gp_name: 'q-gp-organisation-name',
        registered_with_gp: 'q-applicant-are-you-registered-with-gp',
        registered_gp_attended: 'q-applicant-have-you-seen-a-gp'
    }
});
