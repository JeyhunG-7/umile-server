const _validator = require('validator');

/**
 * Verifies if given object have required params and 
 * their values are not undefined
 * 
 * @param {Object} requestBody API request body that needs verification
 * @param {Object} [requiredParams] required params object to verify against 
 * 
 * Example:
 *     let paramVerify = Validator.verifyParams(req.body, {
 *       toAddresses: 'array',
 *       replyToAddresses: 'email',
 *       bodyText: 'string',
 *       listingId: 'number',
 *       type: 'string'
 *   });
 * 
 * @returns string if error found, null otherwise
 */
const verifyParams = (requestBody, requiredParams = undefined) => {

    if (Object.keys(requestBody).length === 0 && requestBody.constructor === Object) {
        return 'Request is empty!';
    }

    if (requiredParams) {
        for (const [requiredKey, type] of Object.entries(requiredParams)) {
            if (requestBody[requiredKey] == undefined && type !== 'optional') {
                return `missing ${requiredKey}`;
            }
        }
    }

    for (let [key, value] of Object.entries(requestBody)) {

        if (typeof key === "undefined") {
            return 'contains undefined key';
        } else if (requiredParams && requiredParams[key] && typeof requiredParams[key] === 'string') {
            let devMessageActual;

            let check = interpretRequirement(requiredParams[key], value);
            let empty = interpretRequirement('empty', value);

            if (empty) devMessageActual = 'empty';

            if (!check) return `${key} has a value of ${devMessageActual || typeof value}, but expected ${requiredParams[key]}`;

        } else if (requiredParams && typeof requiredParams[key] === "undefined") {

            return `${key} has a value of some sort, but nothing was expected`;

        } else if (requiredParams && requiredParams[key].constructor === Object) {

            const check = verifyParams(value, requiredParams[key]);

            if (check) return `${key} object: ${check}`;

        } else if (typeof value === "undefined") {

            return `${key} has a value of undefined`;
        }
    }

    return null;
}

module.exports = { verifyParams }

/**
 * Interpreter that finds required validator.js method.
 * Compares against it. 
 * 
 * @param {string} inOption option that value being checked against
 * @param {(string|number|boolean)} value value being checked
 * @returns {boolean}
 */
function interpretRequirement(inOption, value) {
    const option = inOption.toLowerCase();

    switch (option) {
        case 'optional':
            return typeof value != undefined || (typeof value === 'string' && !_validator.isEmpty(value));
        case 'array':
            return Array.isArray(value);
        case 'empty':
            return typeof value === 'string' && _validator.isEmpty(value);
        case 'boolean':
            return typeof value === 'boolean' || (typeof value === 'string' && _validator.isBoolean(value));
        case 'url':
            return (typeof value === 'string' && _validator.isURL(value));
        case 'hex_color':
            return (typeof value === 'string' && _validator.isHexColor(value));
        case 'email':
            return (typeof value === 'string' && _validator.isEmail(value));
        case 'alphanumeric':
            return (typeof value === 'string' && _validator.isAlphanumeric(value));
        case 'alpha_or_numeric':
            return typeof value === 'string' || (typeof value === 'number' || (typeof value === 'string' && _validator.isNumeric(value)));
        case 'integer':
            return (typeof value === 'number' && _validator.isInt(value + ''));
        case 'number':
            return typeof value === 'number' || (typeof value === 'string' && _validator.isNumeric(value));
        case 'string':
            return typeof value === 'string';
        case 'present':
            return typeof value != undefined || (typeof value === 'string' && !_validator.isEmpty(value));
        default:
            return false;
    }
}