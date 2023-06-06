'use strict';

// These columns should be inserted into the address_details table
module.exports = Object.freeze({
    ICA: {
        'q-applicant-scottish-town-or-city': 'address_line_1',
        'q-applicant-scottish-location': 'address_line_4'
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
    DEA: {}
});
