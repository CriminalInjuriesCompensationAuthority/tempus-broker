'use strict';

const invalidInjuryCodes = require('../../constants/ineligible-injury-codes');
const ApplicationType = require('../../constants/application-type');

/**
 * The applicant is ineligible if only claiming for certain injuries
 *  We skip this check if the claim is a fatality
 *
 * @param {Object} dbApplicationForm - The database application form object that will be updated based on the eligibility rules.
 */
function checkEligibilityForInvalidInjuries(dbApplicationForm) {
    const { application_type, injury_details_code } = dbApplicationForm || {};

    // Early return if no injury details or irrelevant application type
    if (!injury_details_code || 
        !(application_type === ApplicationType.PERSONAL_INJURY || 
          application_type === ApplicationType.PERIOD_OF_ABUSE)) {
        return true;
    }

    const injuryCodes = injury_details_code.split(':');
    let hasValidCode = false;

    for (const code of injuryCodes) {
        if (invalidInjuryCodes.includes(code)) {
            continue; // Skip invalid codes
        } else {
            hasValidCode = true; // Found a valid code
            break; // Exit the loop since at least one valid code is enough
        }
    }

    // Return true if a valid code is found, otherwise false
    return hasValidCode;
}



/**
 *   The applicant is ineligible if they didn't have any injuries
 *   We skip this check if the claim is a fatality
 *
 * @param {Object} dbApplicationForm - The database application form object that will be updated based on the eligibility rules.
 */
function checkEligibilityForNoInjuries(dbApplicationForm) {
    const { 
        application_type, 
        pi_type_cause, 
        physical_injuries, 
        loss_of_foetus, 
        infections, 
        dmi 
    } = dbApplicationForm || {};
    
    if (
        application_type === ApplicationType.PERSONAL_INJURY ||
        application_type === ApplicationType.PERIOD_OF_ABUSE
    ) {
        const noInjuries =
            !pi_type_cause?.includes('SEX') &&
            physical_injuries === 'N' &&
            loss_of_foetus === 'N' &&
            infections === 'N' &&
            dmi === 'N';

        return !noInjuries;
    }

    return true; // Default eligibility if application type does not match
}


module.exports = {checkEligibilityForNoInjuries, checkEligibilityForInvalidInjuries};
