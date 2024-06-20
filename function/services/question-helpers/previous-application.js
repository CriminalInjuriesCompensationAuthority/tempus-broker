'use strict';

const extractKeyValuePairs = require('./extract-key-value-pairs');

const questionIDs = [
    'q-applicant-someone-else-applied-before-for-this-crime',
    'q-applicant-have-you-applied-to-us-before',
    'q-applicant-applied-before-for-this-crime'
];

function getQuestionAnswersMap(data) {
    return extractKeyValuePairs(data, questionIDs);
}

function handleApplicantAppliedBeforeToCICA(answers, form) {
    if (
        form.previous_application_submitted === undefined ||
        form.previous_application_submitted === null
    ) {
        if (answers['q-applicant-have-you-applied-to-us-before'] === true) {
            form.previous_application_submitted = 'Y';
            form.prev_app_for_ci_comp = 'Y';
        } else {
            form.previous_application_submitted = 'N';
            form.prev_app_for_ci_comp = 'N';
        }
    } else if (
        form.previous_application_submitted === 'N' &&
        answers['q-applicant-have-you-applied-to-us-before'] === true
    ) {
        form.previous_application_submitted = 'Y';
        form.prev_app_for_ci_comp = 'Y';
    }
}

function handleApplicantAppliedBeforeForThisCrime(answers, form) {
    if (answers['q-applicant-applied-before-for-this-crime'] === true) {
        form.previous_application_submitted = 'Y';
        form.prev_app_for_ci_comp = 'Y';
    } else {
        form.previous_application_submitted = 'N';
        form.prev_app_for_ci_comp = 'N';
    }
}

function handleSomeoneElseAppliedBeforeForThisCrime(answers, form) {
    if (answers['q-applicant-someone-else-applied-before-for-this-crime'] === 'yes') {
        form.previous_application_submitted = 'Y';
        form.prev_app_for_ci_comp = 'Y';
    } else if (answers['q-applicant-someone-else-applied-before-for-this-crime'] === 'no') {
        form.previous_application_submitted = 'N';
        form.prev_app_for_ci_comp = 'N';
    } else {
        form.previous_application_submitted = null;
        form.prev_app_for_ci_comp = null;
    }
}

function mapPreviousApplication(data, form) {
    const answers = getQuestionAnswersMap(data);

    if (Object.keys(answers).length === 0) {
        return;
    }

    if ('q-applicant-someone-else-applied-before-for-this-crime' in answers) {
        handleSomeoneElseAppliedBeforeForThisCrime(answers, form);
    } else if ('q-applicant-applied-before-for-this-crime' in answers) {
        handleApplicantAppliedBeforeForThisCrime(answers, form);
    }

    if ('q-applicant-have-you-applied-to-us-before' in answers) {
        handleApplicantAppliedBeforeToCICA(answers, form);
    }
}

function setPreviouslyAppliedEligibility(applicationData, dbApplicationForm) {
    if (dbApplicationForm.is_eligible === 'N') {
        // some other rule has set eligible to No
        return;
    }

    const answers = getQuestionAnswersMap(applicationData);
    if (answers['q-applicant-someone-else-applied-before-for-this-crime'] === 'yes') {
        dbApplicationForm.is_eligible = 'N';
        return;
    }

    if (answers['q-applicant-applied-before-for-this-crime'] === true) {
        dbApplicationForm.is_eligible = 'N';
        return;
    }

    dbApplicationForm.is_eligible = 'Y';
}

module.exports = {questionIDs, mapPreviousApplication, setPreviouslyAppliedEligibility};
