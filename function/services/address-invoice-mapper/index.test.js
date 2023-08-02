'use strict';

const mapAddressInvoices = require('./index');

describe('Address invoice mapper', () => {
    let applicationFormJson;
    let addressDetailsJson;

    beforeEach(() => {
        applicationFormJson = null;
        addressDetailsJson = null;
    });

    it('Should set inv code and inv type to VICT if address type is APA', async () => {
        addressDetailsJson = [
            {
                address_type: 'APA'
            }
        ];
        const newAddressDetails = await mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('VICT');
        expect(newAddressDetails[0].inv_type).toEqual('VICT');
    });

    it('Should set inv code and inv type to VICT if address type is DCA', async () => {
        addressDetailsJson = [
            {
                address_type: 'DCA'
            }
        ];
        const newAddressDetails = await mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('VICT');
        expect(newAddressDetails[0].inv_type).toEqual('VICT');
    });

    it('Should set inv code to DENT and inv type to MED if address type is DEA', async () => {
        addressDetailsJson = [
            {
                address_type: 'DEA'
            }
        ];
        const newAddressDetails = await mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('DENT');
        expect(newAddressDetails[0].inv_type).toEqual('MED');
    });

    it('Should set inv code to GP, inv type to MED, and sub type to MPRA if address type is DOA', async () => {
        addressDetailsJson = [
            {
                address_type: 'DOA'
            }
        ];
        const newAddressDetails = await mapAddressInvoices(addressDetailsJson, applicationFormJson);
        expect(newAddressDetails[0].inv_code).toEqual('GP');
        expect(newAddressDetails[0].inv_type).toEqual('MED');
        expect(newAddressDetails[0].sub_type).toEqual('MPRA');
    });

    describe('PAB address details', () => {
        beforeEach(() => {
            addressDetailsJson = [
                {
                    address_type: 'PAB'
                }
            ];
        });

        it('Should set inv code to CMCO and inv type to MED if address type is PAB and the representative type is claims management company', async () => {
            applicationFormJson = [
                {
                    representative_type: 'claims management company'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('CMCO');
            expect(newAddressDetails[0].inv_type).toEqual('MED');
        });

        it('Should set inv code to FC and inv type to REP if address type is PAB and the representative type is foster carer', async () => {
            applicationFormJson = [
                {
                    representative_type: 'foster carer'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('FC');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to FRFA and inv type to REP if address type is PAB and the representative type is friend or relative', async () => {
            applicationFormJson = [
                {
                    representative_type: 'friend or relative'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('FRFA');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SSER and inv type to REP if address type is PAB and the representative type is social services', async () => {
            applicationFormJson = [
                {
                    representative_type: 'social services'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('SSER');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SUPP and inv type to REP if address type is PAB and the representative type is support organisation', async () => {
            applicationFormJson = [
                {
                    representative_type: 'support organisation'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('SUPP');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to SOLS and inv type to REP if address type is PAB and the representative type is solicitor', async () => {
            applicationFormJson = [
                {
                    representative_type: 'solicitor'
                }
            ];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('SOLS');
            expect(newAddressDetails[0].inv_type).toEqual('REP');
        });

        it('Should set inv code to MAIN and inv type to APPL if address type is PAB and the representative type is not any of the ones listed above', async () => {
            applicationFormJson = [{}];
            const newAddressDetails = await mapAddressInvoices(
                addressDetailsJson,
                applicationFormJson
            );
            expect(newAddressDetails[0].inv_code).toEqual('MAIN');
            expect(newAddressDetails[0].inv_type).toEqual('APPL');
        });
    });
});
