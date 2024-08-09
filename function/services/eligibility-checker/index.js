'use strict';

const {checkEligibilityPreviousApplications} = require('../question-helpers/previous-application');
const {
    checkEligibilityForInvalidInjuries,
    checkEligibilityForNoInjuries
} = require('../question-helpers/injuries');
const checkGeneralEligibilityRules = require('../question-helpers/general-eligibility-rules');

const INELIGIBLE = 'N';

const eligibilityRules = [
    checkEligibilityPreviousApplications,
    checkEligibilityForInvalidInjuries,
    checkEligibilityForNoInjuries,
    checkGeneralEligibilityRules
];

/**
 * Simple rules engine for handling eligibilty rules,
 * If any rule returns false, that is ineligible,
 * the engine will stop processing and return isEligible = false
 *
 * see https://dsdmoj.atlassian.net/wiki/spaces/CICA/pages/4422926426/Business+Rules
 *
 * @param {Object} applicationData - The application data containing answers and other relevant information.
 * @param {Object} dbApplicationForm - The database application form object used to for mapping to a database.
 */
function runEligibilityRulesEngine(applicationData, dbApplicationForm) {
    let isEligible = true;

    for (const func of eligibilityRules) {
        // Call the function with the appropriate object
        isEligible =
            func.name === 'checkEligibilityPreviousApplications'
                ? func(applicationData)
                : func(dbApplicationForm);

        if (!isEligible) {
            break; // Exit the loop if any isEligible rule returns false
        }
    }

    return isEligible;
}

/**
 * Checks the eligibility of an application based on provided data and updates the database form.
 * @see {@link https://dsdmoj.atlassian.net/wiki/spaces/CICA/pages/4422926426/Business+Rules}
 *
 * @param {Object} applicationData - The application data containing answers and other relevant information.
 * @param {Object} dbApplicationForm - The database application form object that will be mapped to and updated based on the eligibility rules.
 *
 * the dbApplicationForm is created with default values
 * @see {@link ../../function/index.js}
 * @see {@link ../../constants/application-form-default}
 *
 *
 */
function setEligibility(applicationData, dbApplicationForm) {
    let isEligible = runEligibilityRulesEngine(applicationData, dbApplicationForm);

    if (!isEligible) {
        // If an ineligibility rule has returned false, the application cannot become eligible
        dbApplicationForm.is_eligible = INELIGIBLE;
        return;
    }    
}

module.exports = setEligibility;
