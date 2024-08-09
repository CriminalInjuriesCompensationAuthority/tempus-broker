'use strict';

const {
    mapPreviousApplication,
    checkEligibilityPreviousApplications:isEligible
} = require('./previous-application');

describe('mapPreviousApplication', () => {
    describe('applicant ', () => {
        it('Should set columns to "Y" if answered Yes to q-applicant-have-you-applied-to-us-before only', async () => {
            const data = {
                meta: {
                    caseReference: '23\\327507',
                    submittedDate: '2023-05-19T13:06:12.693Z',
                    splitFuneral: false
                },
                themes: [
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "N" if answered No to q-applicant-have-you-applied-to-us-before only', async () => {
            const data = {
                meta: {
                    caseReference: '23\\327507',
                    submittedDate: '2023-05-19T13:06:12.693Z',
                    splitFuneral: false
                },
                themes: [
                    {
                        type: 'theme',
                        id: 'other-compensation',
                        title: 'Other compensation',
                        values: [
                            {
                                id: 'q-applicant-have-you-applied-to-us-before',
                                type: 'simple',
                                value: false,
                                theme: 'other-compensation'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('N');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('N');
        });

        it('Should set columns to `Y` if answered Yes to someone-else-applied-before', async () => {
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
                                value: 'yes',
                                theme: 'about-application'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to `N` if answered No to someone-else-applied-before', async () => {
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
                                value: 'no',
                                theme: 'about-application'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('N');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('N');
        });

        it('Should set columns to null if answered I dont know to someone-else-applied-before', async () => {
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
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe(null);
            expect(applicationFormJson.prev_app_for_ci_comp).toBe(null);
        });

        it('Should set columns to "Y" if answered No to someone-else-applied-before and applied-to-us-before answered Yes', async () => {
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
                                value: 'no',
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "Y" if answered Yes to someone-else-applied-before and applied-to-us-before answered Yes', async () => {
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
                                value: 'yes',
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "Y" if answered Yes to someone-else-applied-before and applied-to-us-before answered No', async () => {
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
                                value: 'yes',
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
                                value: false,
                                theme: 'other-compensation'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "N" if answered I dont know to someone-else-applied-before and applied-to-us-before answered No', async () => {
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
                                value: false,
                                theme: 'other-compensation'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('N');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('N');
        });

        it('Should set columns to "N" if answered I dont know to someone-else-applied-before and applied-to-us-before answered Yes', async () => {
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });
    });

    describe('proxy', () => {
        it('Should set columns to `Y` if proxy answered Yes to someone-else-applied-before', async () => {
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
                                id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                type: 'simple',
                                value: true,
                                theme: 'about-application'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to `N` if proxy answered No to someone-else-applied-before', async () => {
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
                                id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                type: 'simple',
                                value: false,
                                theme: 'about-application'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('N');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('N');
        });

        it('Should set columns to "Y" if proxy answered No to someone-else-applied-before and applied-to-us-before answered Yes', async () => {
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
                                id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                type: 'simple',
                                value: false,
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "Y" if proxy answered Yes to someone-else-applied-before and applied-to-us-before answered Yes', async () => {
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
                                id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                type: 'simple',
                                value: true,
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

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });

        it('Should set columns to "Y" if proxy answered Yes to someone-else-applied-before and applied-to-us-before answered No', async () => {
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
                                id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                type: 'simple',
                                value: true,
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
                                value: false,
                                theme: 'other-compensation'
                            }
                        ]
                    }
                ]
            };

            const applicationFormJson = {};
            mapPreviousApplication(data, applicationFormJson);
            expect(applicationFormJson.previous_application_submitted).toBe('Y');
            expect(applicationFormJson.prev_app_for_ci_comp).toBe('Y');
        });
    });
});

describe('previouslyAppliedEligibility', () => {
    describe('applicant', () => {       
            it('Should be eligible when all previous app questions asked are false', () => {
                const applicationData = {
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
                                    value: 'no',
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
                                    value: false,
                                    theme: 'other-compensation'
                                }
                            ]
                        }
                    ]
                };
                expect(isEligible(applicationData)).toBe(true);
            });

            it('Should be eligible when all previous app questions have not been asked and applied before to cica answered No', () => {
                const applicationData = {
                    meta: {
                        caseReference: '23\\327507',
                        submittedDate: '2023-05-19T13:06:12.693Z',
                        splitFuneral: false
                    },
                    themes: [
                        {
                            type: 'theme',
                            id: 'other-compensation',
                            title: 'Other compensation',
                            values: [
                                {
                                    id: 'q-applicant-have-you-applied-to-us-before',
                                    type: 'simple',
                                    value: false,
                                    theme: 'other-compensation'
                                }
                            ]
                        }
                    ]
                };
                expect(isEligible(applicationData)).toBe(true);
            });

            it('Should be eligible when all previous app questions have not been asked and applied before to cica answered Yes', () => {
                const applicationData = {
                    meta: {
                        caseReference: '23\\327507',
                        submittedDate: '2023-05-19T13:06:12.693Z',
                        splitFuneral: false
                    },
                    themes: [
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
                expect(isEligible(applicationData)).toBe(true);
            });

            it(`Should be eligible when applied-before-for-this-crime answered 
            No but have-you-applied-to-us-before answered Yes`, () => {
                const applicationData = {
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
                                    value: 'no',
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
                expect(isEligible(applicationData)).toBe(true);
            });

            it(`Should be eligible when applied-before-for-this-crime answered 
            I dont know but have-you-applied-to-us-before answered Yes`, () => {
                const applicationData = {
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
                expect(isEligible(applicationData)).toBe(true);
            });

            it(`Should be in-eligible when applied-before-for-this-crime answered 
            Yes but have-you-applied-to-us-before answered No`, () => {
                const applicationData = {
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
                                    value: 'yes',
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
                expect(isEligible(applicationData)).toBe(false);
            });

            it(`Should be in-eligible when applicant applied-before-for-this-crime answered 
            Yes but have-you-applied-to-us-before answered No`, () => {
                const applicationData = {
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
                                    value: true,
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
                                    value: false,
                                    theme: 'other-compensation'
                                }
                            ]
                        }
                    ]
                };
                expect(isEligible(applicationData)).toBe(false);
            });
        
    });

    describe('proxy', () => {
            it('Should be eligible when all previous app questions asked are false', () => {
                const applicationData = {
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
                                    id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                    type: 'simple',
                                    value: false,
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
                                    value: false,
                                    theme: 'other-compensation'
                                }
                            ]
                        }
                    ]
                };
                expect(isEligible(applicationData)).toBe(true);
            });

            it(`Should be eligible when applied-before-for-this-crime answered 
            No but have-you-applied-to-us-before answered Yes`, () => {
                const applicationData = {
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
                                    id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                    type: 'simple',
                                    value: false,
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
                expect(isEligible(applicationData)).toBe(true);
            });

            it(`Should be in-eligible when applied-before-for-this-crime answered 
            Yes but have-you-applied-to-us-before answered No`, () => {
                const applicationData = {
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
                                    id: 'q-proxy-someone-else-applied-before-for-this-crime',
                                    type: 'simple',
                                    value: true,
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
                expect(isEligible(applicationData)).toBe(false);
            });
    });
});
