'use strict';

const mapAddressInvoices = require('./index');

describe('Address invoice mapper', () => {
    let applicationFormJson;
    let addressDetailsJson;

    beforeEach(() => {
        applicationFormJson = null;
        addressDetailsJson = null;
    });

    it('Should set inv code and inv type to VICT if address type is APA', () => {
        addressDetailsJson = [
            {
                address_type: 'APA'
            }
        ];
        const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('VICT');
        expect(newAddressDetails[0].inv_type).toEqual('VICT');
    });

    it('Should set inv code and inv type to VICT if address type is DCA', () => {
        addressDetailsJson = [
            {
                address_type: 'DCA'
            }
        ];
        const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('VICT');
        expect(newAddressDetails[0].inv_type).toEqual('VICT');
    });

    it('Should set inv code to DENT and inv type to MED if address type is DEA', () => {
        addressDetailsJson = [
            {
                address_type: 'DEA'
            }
        ];
        const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('DENT');
        expect(newAddressDetails[0].inv_type).toEqual('MED');
    });

    it('Should set inv code to GP, inv type to MED, and sub type to MPRA if address type is DOA', () => {
        addressDetailsJson = [
            {
                address_type: 'DOA'
            }
        ];
        const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('GP');
        expect(newAddressDetails[0].inv_type).toEqual('MED');
        expect(newAddressDetails[0].sub_type).toEqual('MPRA');
    });

    it('Should set inv code to MAIN and inv type to APPL if address type is PAB', () => {
        addressDetailsJson = [
            {
                address_type: 'PAB'
            }
        ];
        const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('MAIN');
        expect(newAddressDetails[0].inv_type).toEqual('APPL');
    });

    describe('RPA address details', () => {
        beforeEach(() => {
            addressDetailsJson = [
                {
                    address_type: 'RPA'
                }
            ];
        });

        it('Should set inv code to CMCO and inv type to REP if representative type is claims management company', () => {
            applicationFormJson = {
                representative_type: 'claims management company'
            };

            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('CMCO');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to FC and inv type to REP if representative type is foster carer', () => {
            applicationFormJson = {
                representative_type: 'foster carer'
            };
            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('FC');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to FRFA and inv type to REP if representative type is friend or relative', () => {
            applicationFormJson = {
                representative_type: 'friend or relative'
            };

            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('FRFA');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SSER and inv type to REP if representative type is social services', () => {
            applicationFormJson = {
                representative_type: 'social services'
            };
            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('SSER');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SUPP and inv type to REP if representative type is support organisation', () => {
            applicationFormJson = {
                representative_type: 'support organisation'
            };
            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('SUPP');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SOLS and inv type to REP if representative type is solicitor', () => {
            applicationFormJson = {
                representative_type: 'solicitor'
            };
            const newAddressDetails = mapAddressInvoices(addressDetailsJson, applicationFormJson);
            expect(newAddressDetails[0].inv_code).toEqual('SOLS');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });
    });
});
