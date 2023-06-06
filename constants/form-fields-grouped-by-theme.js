'use strict';

module.exports = Object.freeze({
    'about-application': {
        'q--was-the-crime-reported-to-police': 'incident_rep_police',
        'q-applicant-who-are-you-applying-for': 'is_injured_person',
        'q-applicant-british-citizen-or-eu-national': 'residency_02'
    },
    'applicant-details': {
        'q-applicant-what-other-names-have-you-used': 'other_names',
        'q-applicant-enter-your-date-of-birth': 'date_of_birth',
        'q-applicant-enter-your-email-address': 'claimant_email_address',
        'q-applicant-enter-your-telephone-number': 'day_phone',

        'q-applicant-select-reasons-for-the-delay-in-making-your-application':
            'incident_delay_reason_code'
    },
    crime: {
        'q-applicant-when-did-the-crime-happen': 'date_time_of_incident',
        'q--when-was-the-crime-reported-to-police': 'date_time_pol_first_told',
        'q-applicant-did-the-crime-happen-once-or-over-time': 'application_type',
        'q--whats-the-crime-reference-number': 'crime_ref_no',
        'q-applicant-where-did-the-crime-happen': 'incident_country',
        'q-applicant-scottish-location': 'address_line_1',
        'q-applicant-english-location': 'address_line_1',
        'q-applicant-welsh-location': 'address_line_1',
        'q-applicant-scottish-town-or-city': 'address_line_4',
        'q-applicant-english-town-or-city': 'address_line_4',
        'q-applicant-welsh-town-or-city': 'address_line_4',
        'q-police-force-id': 'police_force_area'
    },
    impact: {
        'q-applicant-unable-to-work-duration': 'earn_lost_gt_28_weeks',
        'q-applicant-work-details-option': 'work_situation',
        'q-applicant-job-when-crime-happened': 'work_situation',
        'q-applicant-unable-to-work': 'unable_to_work',
        'q-applicant-work-details-other': 'work_situation_other',
        'q-applicant-affected-daily-capacity': 'affect_daily_capacity',
        'q-applicant-affect-duration': 'affect_gt_28_weeks',
        'q-applicant-affect-future-duration': 'affect_future_gt_28_weeks',
        'q-applicant-future-work': 'future_work'
    },
    injuries: {
        'q-applicant-infections': 'infections',
        'q-applicant-are-you-claiming-for-physical-injuries': 'physical_injuries',
        'q-applicant-physical-injury': 'injury_details_code'
    },
    'mental-health': {
        'q-applicant-do-you-have-disabling-mental-injury': 'dmi',
        'q-applicant-mental-injury-duration': 'dmi_gt_6_weeks'
    },
    offender: {
        'q-offender-do-you-know-the-name-of-the-offender': 'assailant_identified',
        'q-offender-enter-offenders-name': 'name_of_perpetrator'
    },
    'other-compensation': {
        'q-applicant-have-you-applied-to-us-before': 'previous_application_submitted',
        'q-enter-your-previous-reference-number': 'prev_case_ref_num_01',
        'q-applicant-have-you-applied-for-or-received-any-other-compensation':
            'claimed_other_compensation',
        'q-applicant-applied-for-other-compensation-briefly-explain-why-not':
            'why_no_other_compensation'
    },
    pregnancy: {
        'q-applicant-pregnancy': 'pregnancy',
        'q-applicant-pregnancy-loss': 'loss_of_foetus'
    },
    treatment: {
        'q-applicant-are-you-registered-with-gp': 'registered_with_gp',
        'q-applicant-have-you-seen-a-gp': 'registered_gp_attended',
        'q-gp-organisation-name': 'name',
        'q-gp-building-and-street': 'address_line_1',
        'q-gp-building-and-street-2': 'address_line_2',
        'q-gp-building-and-street-3': 'address_line_3',
        'q-gp-town-or-city': 'address_line_4',
        'q-gp-county': 'address_line_5',
        'q-gp-postcode': 'post_code'
    }
});
