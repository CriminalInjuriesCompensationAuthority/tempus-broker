'use strict';

module.exports = Object.freeze({
    'about-application': {
        'q--was-the-crime-reported-to-police': 'incident_rep_police',
        'q-applicant-who-are-you-applying-for': 'is_injured_person',
        'q-applicant-british-citizen-or-eu-national': 'residency_02',
        'q-applicant-claim-type': ['fatality_flag', 'application_type']
    },
    'applicant-details': {
        'q-applicant-what-other-names-have-you-used': 'other_names',
        'q-applicant-enter-your-date-of-birth': 'date_of_birth',
        'q-applicant-enter-your-email-address': 'claimant_email_address',
        'q-applicant-enter-your-telephone-number': 'day_phone',
        'q-applicant-select-reasons-for-the-delay-in-making-your-application':
            'incident_delay_reason_code',
        'q-applicant-title': 'app_title',
        'q-applicant-select-reasons-for-the-delay-in-reporting-the-crime-to-police':
            'incident_report_delay',
        'q-applicant-first-name': 'first_name',
        'q-applicant-last-name': 'last_name',
        'q-applicant-building-and-street': 'address_line_1',
        'q-applicant-building-and-street-2': 'address_line_2',
        'q-applicant-building-and-street-3': 'address_line_3',
        'q-applicant-town-or-city': 'address_line_4',
        'q-applicant-county': 'address_line_5',
        'q-applicant-postcode': 'post_code',
        'q-applicant-capable': 'under_18_or_incapable'
    },
    'main-applicant-details': {
        'q-mainapplicant-title': 'U18_OR_INC_TITLE',
        'q-mainapplicant-first-name': 'U18_OR_INC_FIRST_NAME',
        'q-mainapplicant-last-name': 'U18_OR_INC_NAME',
        'q-mainapplicant-enter-your-email-address': 'U18_OR_INC_EMAIL_ADDRESS',
        'q-mainapplicant-building-and-street': 'address_line_1',
        'q-mainapplicant-building-and-street-2': 'address_line_2',
        'q-mainapplicant-building-and-street-3': 'address_line_3',
        'q-mainapplicant-town-or-city': 'address_line_4',
        'q-mainapplicant-county': 'address_line_5',
        'q-mainapplicant-postcode': 'post_code',
        'q-mainapplicant-enter-your-telephone-number': 'day_phone',
        'q-mainapplicant-relationship': 'u18_or_inc_relationship',
        'q-mainapplicant-shared-responsibility': 'shared_parental_respon',
        'q-mainapplicant-shared-responsibility-name': 'shared_parental_respon_name',
        'q-mainapplicant-care-order': 'care_order',
        'q-mainapplicant-care-order-authority': 'care_order_details'
    },
    'rep-details': {
        'q-rep-type': [
            'representative_type',
            'has_representative',
            'rep_correspond_direct',
            'rep_claims_company'
        ],
        'q-rep-organisation-name': 'rep_organisation',
        'q-rep-title': 'rep_title',
        'q-rep-first-name': 'rep_first_name',
        'q-rep-last-name': 'rep_last_time',
        'q-rep-building-and-street': 'address_line_1',
        'q-rep-building-and-street-2': 'address_line_2',
        'q-rep-building-and-street-3': 'address_line_3',
        'q-rep-town-or-city': 'address_line_4',
        'q-rep-county': 'address_line_5',
        'q-rep-postcode': 'post_code',
        'q-rep-email-address': 'rep_email_address',
        'q-rep-telephone-number': 'rep_telephone',
        'q-rep-claims-management-reg': 'rep_claims_company_reg',
        'q-rep-reference-number': 'rep_reference'
    },
    crime: {
        'q-applicant-when-did-the-crime-happen': 'date_time_of_incident',
        'q-applicant-when-did-the-crime-start': 'date_time_of_incident',
        'q-applicant-when-did-the-crime-stop': 'date_time_of_incident_to',
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
        'q-applicant-crime-location': [
            'address_line_1',
            'address_line_2',
            'address_line_3',
            'address_line_4',
            'address_line_5'
        ],
        'q-police-force-id': 'police_force_area',
        'q-applicant-incident-type': 'pi_type_cause',
        'q-applicant-incident-description': 'description_of_incident'
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
        'q-applicant-physical-injuries': 'injury_details_code',
        'q-applicant-physical-injuries-upper-head-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-face-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-neck-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-eye-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-ear-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-nose-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-mouth-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-skin-other': 'injury_details_code',
        'q-applicant-physical-injuries-upper-muscle-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-shoulder-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-chest-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-abdomen-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-back-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-pelvis-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-genitals-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-skin-other': 'injury_details_code',
        'q-applicant-physical-injuries-torso-muscle-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-shoulder-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-arms-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-elbow-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-wrist-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-hand-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-digit-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-skin-other': 'injury_details_code',
        'q-applicant-physical-injuries-arms-muscle-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-hip-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-leg-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-ankle-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-toes-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-skin-other': 'injury_details_code',
        'q-applicant-physical-injuries-legs-muscle-other': 'injury_details_code'
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
        'q-gp-postcode': 'post_code',
        'q-applicant-dentist-visited': 'dentist_visit',
        'q-applicant-dentist-organisation-name': 'name',
        'q-applicant-dentist-address-building-and-street': 'address_line_1',
        'q-applicant-dentist-address-building-and-street-2': 'address_line_2',
        'q-applicant-dentist-address-building-and-street-3': 'address_line_3',
        'q-applicant-dentist-address-town-or-city': 'address_line_4',
        'q-applicant-dentist-address-county': 'address_line_5',
        'q-applicant-dentist-address-postcode': 'post_code'
    },
    'special-expenses': {
        'q-applicant-se-treatment': 'applicant_expenses',
        'q-applicant-se-home-care': 'applicant_expenses',
        'q-applicant-se-home-changes': 'applicant_expenses',
        'q-applicant-se-equipment': 'applicant_expenses',
        'q-applicant-se-aids': 'applicant_expenses',
        'q-applicant-se-other': 'applicant_expenses'
    },
    'additional-info': {
        'q-applicant-additional-information': 'additional_info'
    },
    deceased: {
        'q-deceased-date-of-birth': 'dec_date_of_birth',
        'q-deceased-date-of-death': 'dec_date_of_death',
        'q-deceased-title': 'dec_title',
        'q-deceased-first-name': 'dec_first_name',
        'q-deceased-last-name': 'dec_last_name',
        'q-deceased-building-and-street': 'address_line_1',
        'q-deceased-building-and-street-2': 'address_line_2',
        'q-deceased-building-and-street-3': 'address_line_3',
        'q-deceased-town-or-city': 'address_line_4',
        'q-deceased-county': 'address_line_5',
        'q-deceased-postcode': 'post_code'
    },
    'relationship-to-deceased': {
        'q-applicant-relationship-to-deceased': 'relationship_to_deceased',
        'q-applicant-relationship-other': 'other_relationship_to_deceased',
        'q-applicant-living-together': 'estranged_from_deceased',
        'q-applicant-living-apart': 'estranged_from_deceased',
        'q-applicant-contact-with-deceased': 'estranged_from_deceased',
        'q-applicant-financial-help': 'financially_dependent',
        'q-applicant-physical-help': 'financially_dependent',
        'q-other-claimants': 'other_claimants',
        'q-other-claimants-details': 'other_claimant_name_01',
        'q-applicant-immediate-aftermath': 'present_at_incident'
    },
    'funeral-costs': {
        'q-applicant-funeral-costs-paid': 'funeral_claim',
        'q-applicant-funeral-costs-total': 'funeral_total_cost'
    },

    // Note: Theme may be incorrect due to not having test data
    // Question IDs should be correct though
    'residency-statements': {
        'q-applicant-ordinarily-resident': 'residency_01',
        'q-applicant-british-citizen': 'residency_02',
        'q-applicant-british-citizen-relative': 'residency_03',
        'q-applicant-eu-citizen': 'residency_04',
        'q-applicant-eu-citizen-relative': 'residency_05',
        'q-applicant-eea-citizen': 'residency_04',
        'q-applicant-eea-citizen-relative': 'residency_05',
        'q-applicant-other-citizen': 'residency_06',
        'q-applicant-armed-forces': 'residency_07',
        'q-applicant-armed-forces-relative': 'residency_08',
        'q-applicant-victim-human-trafficking': 'residency_09',
        'q-applicant-applied-for-asylum': 'residency_10'
    }
});
