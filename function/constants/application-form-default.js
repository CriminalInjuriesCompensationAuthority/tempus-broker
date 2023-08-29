'use strict';

function getDefaultApplicationForm() {
    return {
        prefix: 'U',
        section_ref: 'TEMP',
        is_eligible: 'Y',
        NEW_OAS: 'Y',
        is_transgender: 'N',
        is_disabled: 'N',
        ethnicity: 'EG17',
        has_representative: 'N',
        rep_correspond_direct: 'N',
        rep_claims_company: 'N',
        injured_with_rep: 'N',
        contact_by_email: 'N',
        victim_support: 'N',
        dec_convictions_abroad: 'N',
        appl_defer: 'N',
        caused_inability_to_work: 'N',
        live_same_house: 'N',
        include_doc: 'N',
        cica_to_send_summary: 'N',
        incident_present: 'N',
        treatment_received: 'N',
        caused_cost_for_treatment: 'N',
        contact_by_phone: 'N',
        channel: 'W',
        legal_responsibility: 'N',
        curr_stat_type: '20',
        mult_appl: 'N',
        u18_or_inc_correspond_direct: 'N',
        uploaded_document: 'N',
        seen_psych: 'N',
        opt_in_sa: 'Y',
        opt_in_scarring: 'N',
        found_injuries: 'N',
        ae_visited: 'N',
        treatment_other_prov: 'N',
        print_summary: 'N',
        hospital_visit: 'N',
        future_treatment: 'N',
        scarring: 'N',
        case_gone_to_court: 'N',
        case_going_to_court: 'N',
        relationship_date_ok: 'N',
        has_made_other_claim: 'N',
        financially_dependent: 'N',
        other_claimants: 'N',
        present_at_incident: 'N',
        able_to_obtain: 'N',
        able_to_pay: 'N',
        opt_in_diversity: 'N',
        living_together: 'N',
        convictions_abroad: 'N',
        loaded_to_spp: 'N',
        care_order: 'N',
        estranged_from_deceased: 'N',
        relat_to_deceased_cohab: 'N',
        funeral_only: 'N',
        treatment_still_received: 'N',
        victim_made_statement: 'N',
        earn_lost_gt_28_weeks: 'N'
    };
}

module.exports = getDefaultApplicationForm;
