'use strict';

function extractKeyValuePairs(data, targetIds) {
    const resultMap = new Map();

    if (data.themes) {
        data.themes.forEach(theme => {
            theme.values.forEach(valueObj => {
                if (targetIds.includes(valueObj.id)) {
                    resultMap.set(valueObj.id, valueObj.value);
                }
            });
        });
    }

    return Object.fromEntries(resultMap);
}

module.exports = extractKeyValuePairs;
