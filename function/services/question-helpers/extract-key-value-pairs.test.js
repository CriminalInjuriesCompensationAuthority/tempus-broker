'use strict';

const extractKeyValuePairs = require('./extract-key-value-pairs');

describe('extractKeyValuePairs', () => {
    const data = {
        meta: {
            caseReference: '23\\327507',
            submittedDate: '2023-05-19T13:06:12.693Z',
            splitFuneral: false
        },
        themes: [
            {
                type: 'theme',
                id: 'about-application',
                title: 'About your application',
                values: [
                    {
                        id: 'q-applicant-applied-before-for-this-crime',
                        type: 'simple',
                        value: false,
                        theme: 'about-application'
                    },
                    {
                        id: 'q-applicant-someone-else-applied-before-for-this-crime',
                        type: 'simple',
                        value: 'dont-know',
                        theme: 'about-application'
                    }
                ]
            },
            {
                type: 'theme',
                id: 'other-compensation',
                title: 'Other compensation',
                values: [
                    {
                        id: 'q-applicant-have-you-applied-to-us-before',
                        type: 'simple',
                        value: true,
                        theme: 'other-compensation'
                    }
                ]
            }
        ]
    };

    const targetIds = [
        'q-applicant-applied-before-for-this-crime',
        'q-applicant-have-you-applied-to-us-before'
    ];

    test('extracts key-value pairs for specified IDs', () => {
        const result = extractKeyValuePairs(data, targetIds);
        const expected = {
            'q-applicant-applied-before-for-this-crime': false,
            'q-applicant-have-you-applied-to-us-before': true
        };
        expect(result).toEqual(expected);
        expect(expected).not.toHaveProperty(
            'q-applicant-someone-else-applied-before-for-this-crime'
        );
    });

    test('returns an empty object when no IDs match', () => {
        const result = extractKeyValuePairs(data, ['non-existent-id']);
        expect(result).toEqual({});
    });

    test('returns an empty object when there are no themes', () => {
        const emptyData = {themes: []};
        const result = extractKeyValuePairs(emptyData, targetIds);
        expect(result).toEqual({});
    });
});
