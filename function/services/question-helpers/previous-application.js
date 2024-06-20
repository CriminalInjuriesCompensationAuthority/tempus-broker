'use strict';

const extractKeyValuePairs = require('./extract-key-value-pairs');

const questionIDs = [
    'q-applicant-someone-else-applied-before-for-this-crime',
    'q-applicant-have-you-applied-to-us-before',
    'q-applicant-applied-before-for-this-crime',
    'q-proxy-someone-else-applied-before-for-this-crime'
];

const ANSWER_YES = 'yes';
const ANSWER_NO = 'no';
const ANSWER_TRUE = true;
const ANSWER_FALSE = false;

function getQuestionAnswersMap(data) {
    return extractKeyValuePairs(data, questionIDs);
}

function updateFormForPreviousApplication(form, hasApplied) {
    const value = hasApplied ? 'Y' : 'N';
    form.previous_application_submitted = value;
    form.prev_app_for_ci_comp = value;
}

function handleApplicantAppliedBeforeToCICA(answers, form) {
    const appliedBefore = answers['q-applicant-have-you-applied-to-us-before'] === ANSWER_TRUE;

    if (
        form.previous_application_submitted == null ||
        (form.previous_application_submitted === 'N' && appliedBefore)
    ) {
        updateFormForPreviousApplication(form, appliedBefore);
    }
}

function handleApplicantAppliedBeforeForThisCrime(answers, form) {
    const appliedBefore = answers['q-applicant-applied-before-for-this-crime'] === ANSWER_TRUE;
    updateFormForPreviousApplication(form, appliedBefore);
}

function handleSomeoneElseAppliedBeforeForThisCrime(answers, form) {
    const someoneElseApplied =
        answers['q-applicant-someone-else-applied-before-for-this-crime'] ||
        answers['q-proxy-someone-else-applied-before-for-this-crime'];

    if (someoneElseApplied === ANSWER_YES || someoneElseApplied === ANSWER_TRUE) {
        updateFormForPreviousApplication(form, true);
    } else if (someoneElseApplied === ANSWER_NO || someoneElseApplied === ANSWER_FALSE) {
        updateFormForPreviousApplication(form, false);
    } else {
        form.previous_application_submitted = null;
        form.prev_app_for_ci_comp = null;
    }
}

function mapPreviousApplication(applicationData, dbApplicationForm) {
    const answers = getQuestionAnswersMap(applicationData);

    if (Object.keys(answers).length === 0) {
        return;
    }

    if (
        'q-applicant-someone-else-applied-before-for-this-crime' in answers ||
        'q-proxy-someone-else-applied-before-for-this-crime' in answers
    ) {
        handleSomeoneElseAppliedBeforeForThisCrime(answers, dbApplicationForm);
    } else if ('q-applicant-applied-before-for-this-crime' in answers) {
        handleApplicantAppliedBeforeForThisCrime(answers, dbApplicationForm);
    }

    if ('q-applicant-have-you-applied-to-us-before' in answers) {
        handleApplicantAppliedBeforeToCICA(answers, dbApplicationForm);
    }
}

function setPreviouslyAppliedEligibility(applicationData, dbApplicationForm) {
    if (dbApplicationForm.is_eligible === 'N') {
        return; // Another rule has already set eligibility to No
    }

    const answers = getQuestionAnswersMap(applicationData);
    const someoneElseApplied =
        answers['q-applicant-someone-else-applied-before-for-this-crime'] === ANSWER_YES ||
        answers['q-proxy-someone-else-applied-before-for-this-crime'] === ANSWER_TRUE;
    const applicantAppliedBefore =
        answers['q-applicant-applied-before-for-this-crime'] === ANSWER_TRUE;

    dbApplicationForm.is_eligible = someoneElseApplied || applicantAppliedBefore ? 'N' : 'Y';
}

module.exports = {questionIDs, mapPreviousApplication, setPreviouslyAppliedEligibility};
