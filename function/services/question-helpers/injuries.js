'use strict';

const invalidInjuryCodes = require('../../constants/ineligible-injury-codes');
const ApplicationType = require('../../constants/application-type');

/**
 * Checks eligibility based on injury-related rules for Personal Injury (PI) and Period of Abuse (POA) applications.
 *
 * Returns false only when a PI/POA applicant has no injuries AND no valid injury codes.
 * Handles 'SEX' cause + DMI >6wks/ongoing as auto‑eligible.
 *
 * @param {Object} dbApplicationForm - Form values used for eligibility rules.
 * @returns {boolean} true if eligible under injury rules, otherwise false.
 */
function checkEligibilityForInjuries(dbApplicationForm) {
    const {
        application_type,
        injury_details_code,
        pi_type_cause,
        physical_injuries,
        loss_of_foetus,
        infections,
        dmi,
        dmi_gt_6_weeks,
        DMI_ONGOING
    } = dbApplicationForm || {};

    const isRelevantApplication =
        application_type === ApplicationType.PERSONAL_INJURY ||
        application_type === ApplicationType.PERIOD_OF_ABUSE;

    if (
        !isRelevantApplication ||
        dmi_gt_6_weeks === 'Y' ||
        DMI_ONGOING === 'Y' ||
        pi_type_cause?.includes('SEX')
    ) {
        return true;
    }

    if (injury_details_code) {
        const hasValidCode = injury_details_code
            .split(':')
            .some(code => !invalidInjuryCodes.includes(code));

        return hasValidCode;
    }

    const hasNoInjuries =
        physical_injuries === 'N' &&
        loss_of_foetus === 'N' &&
        infections === 'N' &&
        (dmi === 'N' || (dmi === 'Y' && dmi_gt_6_weeks === 'N' && DMI_ONGOING === 'N'));

    if (hasNoInjuries) {
        return false;
    }

    return true;
}

module.exports = {
    checkEligibilityForInjuries
};
