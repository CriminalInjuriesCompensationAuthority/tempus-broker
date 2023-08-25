'use strict';

function mapAddressInvoices(addressDetailsJson, applicationFormJson) {
    const invAddedAddressDetailsJson = addressDetailsJson;

    Object.entries(addressDetailsJson).forEach(entry => {
        const [index, details] = entry;
        Object.entries(details).forEach(detail => {
            const [key, value] = detail;
            // set invoices based on address types according to business rules
            if (key === 'address_type') {
                switch (value) {
                    case 'APA':
                        invAddedAddressDetailsJson[index].inv_code = 'VICT';
                        invAddedAddressDetailsJson[index].inv_type = 'VICT';
                        break;
                    case 'DCA':
                        invAddedAddressDetailsJson[index].inv_code = 'VICT';
                        invAddedAddressDetailsJson[index].inv_type = 'VICT';
                        break;
                    case 'DEA':
                        invAddedAddressDetailsJson[index].inv_code = 'DENT';
                        invAddedAddressDetailsJson[index].inv_type = 'MED';
                        break;
                    case 'DOA':
                        invAddedAddressDetailsJson[index].inv_code = 'GP';
                        invAddedAddressDetailsJson[index].inv_type = 'MED';
                        invAddedAddressDetailsJson[index].sub_type = 'MPRA';
                        break;
                    case 'PAB':
                        invAddedAddressDetailsJson[index].inv_code = 'MAIN';
                        invAddedAddressDetailsJson[index].inv_type = 'APPL';
                        break;
                    case 'RPA':
                        switch (applicationFormJson?.representative_type?.toLowerCase()) {
                            case 'claims management company':
                                invAddedAddressDetailsJson[index].inv_code = 'CMCO';
                                invAddedAddressDetailsJson[index].inv_type = 'MED';
                                break;
                            case 'foster carer':
                                invAddedAddressDetailsJson[index].inv_code = 'FC';
                                invAddedAddressDetailsJson[index].inv_type = 'REP';
                                break;
                            case 'friend or relative':
                                invAddedAddressDetailsJson[index].inv_code = 'FRFA';
                                invAddedAddressDetailsJson[index].inv_type = 'REP';
                                break;
                            case 'social services':
                                invAddedAddressDetailsJson[index].inv_code = 'SSER';
                                invAddedAddressDetailsJson[index].inv_type = 'REP';
                                break;
                            case 'support organisation':
                                invAddedAddressDetailsJson[index].inv_code = 'SUPP';
                                invAddedAddressDetailsJson[index].inv_type = 'REP';
                                break;
                            case 'solicitor':
                                invAddedAddressDetailsJson[index].inv_code = 'SOLS';
                                invAddedAddressDetailsJson[index].inv_type = 'REP';
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    });
    return invAddedAddressDetailsJson;
}

module.exports = mapAddressInvoices;
