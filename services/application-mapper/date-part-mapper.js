'use strict';

// Maps a timestamp to a format consistent with tariff
function mapTimestampToTariffFormat(timestampValue) {
    const dateParts = timestampValue.split('-');
    let dateString = dateParts[2].slice(0, 2);
    switch (dateParts[1]) {
        case '01':
            dateString += '-JAN-';
            break;
        case '02':
            dateString += '-FEB-';
            break;
        case '03':
            dateString += '-MAR-';
            break;
        case '04':
            dateString += '-APR-';
            break;
        case '05':
            dateString += '-MAY-';
            break;
        case '06':
            dateString += '-JUN-';
            break;
        case '07':
            dateString += '-JUL-';
            break;
        case '08':
            dateString += '-AUG-';
            break;
        case '09':
            dateString += '-SEP-';
            break;
        case '10':
            dateString += '-OCT-';
            break;
        case '11':
            dateString += '-NOV-';
            break;
        case '12':
            dateString += '-DEC-';
            break;
        default:
            dateString += '-ERR-';
    }

    return dateString + dateParts[0].substring(2);
}

module.exports = mapTimestampToTariffFormat;
