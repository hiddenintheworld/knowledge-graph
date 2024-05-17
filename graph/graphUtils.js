export function removeEmptyAttributes(obj) {
    let filteredObj = {};
    Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
            // Filter out empty strings from the array and check if the array is not empty
            let filteredArray = obj[key].filter(item => item !== null && item !== undefined && item !== '');
            if (filteredArray.length > 0) {
                filteredObj[key] = filteredArray;
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively filter non-array objects
            let filteredChildObject = removeEmptyAttributes(obj[key]);
            if (Object.keys(filteredChildObject).length > 0) {
                filteredObj[key] = filteredChildObject;
            }
        } else if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            // Keep non-object, non-null, non-undefined, and non-empty string values
            filteredObj[key] = obj[key];
        }
    });
    return filteredObj;
}
