'use strict';

// These columns should be inserted into the address_details table
module.exports = Object.freeze({
    ICA: {
        'q-applicant-scottish-town-or-city': 'address_line_4',
        'q-applicant-scottish-location': 'address_line_1',
        'q-applicant-english-town-or-city': 'address_line_4',
        'q-applicant-english-location': 'address_details.address_line_1',
        'q-applicant-welsh-town-or-city': 'address_line_4',
        'q-applicant-welsh-location': 'address_line_1'
    },
    DOA: {
        'q-gp-organisation-name': 'name',
        'q-gp-building-and-street': 'address_line_1',
        'q-gp-building-and-street-2': 'address_line_2',
        'q-gp-building-and-street-3': 'address_line_3',
        'q-gp-town-or-city': 'address_line_4',
        'q-gp-county': 'address_line_5',
        'q-gp-postcode': 'post_code'
    },
    DEA: {
        'q-applicant-dentist-organisation-name': 'name',
        'q-applicant-dentist-address-building-and-street': 'address_line_1',
        'q-applicant-dentist-address-building-and-street-2': 'address_line_2',
        'q-applicant-dentist-address-building-and-street-3': 'address_line_3',
        'q-applicant-dentist-address-town-or-city': 'address_line_4',
        'q-applicant-dentist-address-county': 'address_line_5',
        'q-applicant-dentist-address-postcode': 'post_code'
    },
    APA: {
        'q-applicant-building-and-street': 'address_line_1',
        'q-applicant-building-and-street-2': 'address_line_2',
        'q-applicant-building-and-street-3': 'address_line_3',
        'q-applicant-town-or-city': 'address_line_4',
        'q-applicant-county': 'address_line_5',
        'q-applicant-postcode': 'post_code'
    },
    PAB: {
        'q-mainapplicant-building-and-street': 'address_line_1',
        'q-mainapplicant-building-and-street-2': 'address_line_2',
        'q-mainapplicant-building-and-street-3': 'address_line_3',
        'q-mainapplicant-town-or-city': 'address_line_4',
        'q-mainapplicant-county': 'address_line_5',
        'q-mainapplicant-postcode': 'post_code'
    },
    RPA: {
        'q-rep-organisation-name': 'name',
        'q-rep-building-and-street': 'address_line_1',
        'q-rep-building-and-street-2': 'address_line_2',
        'q-rep-building-and-street-3': 'address_line_3',
        'q-rep-town-or-city': 'address_line_4',
        'q-rep-county': 'address_line_5',
        'q-rep-postcode': 'post_code'
    },
    DCA: {
        'q-deceased-title': 'name',
        'q-deceased-first-name': 'name',
        'q-deceased-last-name': 'name',
        'q-deceased-building-and-street': 'address_line_1',
        'q-deceased-building-and-street-2': 'address_line_2',
        'q-deceased-building-and-street-3': 'address_line_3',
        'q-deceased-town-or-city': 'address_line_4',
        'q-deceased-county': 'address_line_5',
        'q-deceased-postcode': 'post_code'
    }
});
