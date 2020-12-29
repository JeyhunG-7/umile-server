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
exports.verifyParams = function (requestBody, requiredParams = undefined) {
    let errors = {};
    let atLeastOneError = false;

    if (Object.keys(requestBody).length === 0 && requestBody.constructor === Object) {
        return 'Request is empty!';
    }

    if (requiredParams) {
        for (const [requiredKey, type] of Object.entries(requiredParams)) {
            if (requestBody[requiredKey] == undefined && type !== 'optional') {
                return `Request is missing ${requiredKey}!`;
            }
        }
    }

    for (let [key, value] of Object.entries(requestBody)) {

        if (typeof key === "undefined") {
            return 'Request contains undefined key!';
        } else if (requiredParams && requiredParams[key]) {
            let devMessageActual;

            if (typeof requiredParams[key] != 'string') {
                return 'Specification for required paramaters can only be string, but was ' + typeof requiredParams[key];
            }

            let check = interpretRequirement(requiredParams[key], value);
            let empty = interpretRequirement('empty', value);

            if (empty) devMessageActual = 'empty';

            if (!check) {
                atLeastOneError = true;

                errors[key] = {
                    "actual": devMessageActual || typeof value,
                    "expected": requiredParams[key]

                }
            }
        } else if (requiredParams && typeof requiredParams[key] === "undefined") {
            atLeastOneError = true;

            errors[key] = {
                "actual": "some sort",
                "expected": "nothing"
            }
        } else if (typeof value === "undefined") {
            atLeastOneError = true;

            errors[key] = {
                "actual": "undefined",
                "expected": ""
            }
        }
    }

    if (atLeastOneError) {
        let devMessage = 'Error:';

        for (let [key, value] of Object.entries(errors)) {

            let lastPart = requiredParams ? `, but expected ${value.expected};` : ';'

            devMessage += ` ${key} has a value of ${value.actual}${lastPart}`;
        }

        return devMessage.substr(0, devMessage.length - 1);
    }

    return null;
}

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
            return (typeof value === 'string' && _validator.isInt(value));
        case 'number':
            return typeof value === 'number' || (typeof value === 'string' && _validator.isNumeric(value));
        case 'string':
            return typeof value === 'string';
        case 'present':
            return typeof value != undefined || (typeof value === 'string' && !_validator.isEmpty(value));
        case 'object':
            return typeof value === 'object';
        default:
            return false;
    }
}