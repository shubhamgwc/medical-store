/**
 * Utility class for validating input data.
 * @file validate.util.ts
 * @module validate
 * @category utils
 * @subcategory validation
 */

class Validate {
    error: string[];


    constructor() {
        // Initialize an empty array to store error messages
        this.error = [];
    };


    /**
     * Validates the input body against the provided validation rules.
     * @function validate
     * @param {Record<string, any>} body - The object to validate.
     * @param {Record<string, string>} validateArr - The validation rules for each field.
     * @returns {{ hasError: boolean; errors?: string[] }} - Validation result including errors if any.
     */
    validate(body: Record<string, any>, validateArr: Record<string, string>): { hasError: boolean; errors?: string[]; } {
        this.error = []; // Reset errors for each validation call
        let result: { hasError: boolean; errors?: string[] } = { hasError: false };
        let bodyParams = Object.keys(body); // Extract keys from the body
        let validationParams = Object.keys(validateArr); // Extract validation keys

        // Iterate through each validation parameter
        for (let validationParam of validationParams) {
            let paramToValidate = validationParam;
            let isExist = this.isInArray(paramToValidate, bodyParams); // Check if parameter exists in body

            if (isExist) {
                let rules = validateArr[paramToValidate]; // Get validation rules for the parameter
                let rulesArray = rules.split(","); // Split rules into an array
                for (let rule of rulesArray) {
                    // Ensure the validation function exists before invoking it
                    if (this[rule as keyof Validate]) {
                        (this[rule as keyof Validate] as Function)(paramToValidate, body[paramToValidate]);
                    };
                };
            }
            else {
                this.error.push(`Please pass ${paramToValidate} parameter`); // Parameter missing error
            };
        };

        // If there are errors, update the result object
        if (this.error.length > 0) {
            result.hasError = true;
            result.errors = this.error;
        };

        return result; // Return validation result
    };


    /**
     * Checks if the required field is present and not empty.
     * @function required
     * @param {string} name - The name of the field.
     * @param {any} value - The value of the field.
     */
    required(name: string, value: any) {
        if (typeof value === "string" && value.trim() === '') {
            this.error.push(`${name} is required`); // String is empty
        }

        else if ((value === '' || value?.length === 0) && value !== 0) {
            this.error.push(`${name} is required`); // Non-string value is empty
        };
    };


    /**
     * Checks if the value is numeric.
     * @function numeric
     * @param {string} name - The name of the field.
     * @param {any} value - The value to check.
     */
    numeric(name: string, value: any) {
        if (isNaN(value)) {
            this.error.push(`${name} should be numeric`); // Not a number error
        };
    };


    /**
     * Checks if the value is in JSON format.
     * @function json
     * @param {string} name - The name of the field.
     * @param {any} value - The value to check.
     */
    json(name: string, value: any) {
        if (typeof value === "string" || typeof value === "number" || Object.keys(value).length === 0) {
            this.error.push(`${name} should be in JSON format`); // Not in JSON format error
        };
    };


    /**
     * Validates the date format.
     * @function date
     * @param {string} name - The name of the field.
     * @param {string} value - The date string to validate.
     */
    date(name: string, value: string) {
        let pattern = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/; // Date format: YYYY-MM-DD
        let valid = pattern.test(value);
        if (!valid) {
            this.error.push(`${name} is not a valid date`); // Invalid date error
        };
    };


    /**
     * Checks if a value exists in an array.
     * @function isInArray
     * @param {string} value - The value to check.
     * @param {string[]} array - The array to search in.
     * @returns {boolean} - True if the value is in the array, false otherwise.
     */
    isInArray(value: string, array: string[]): boolean {
        return Array.isArray(array) && array.indexOf(value) > -1; // Check for existence in array
    };


    /**
     * Validates the email format.
     * @function isEmail
     * @param {string} email - The name of the field.
     * @param {string} value - The email string to validate.
     */
    isEmail(email: string, value: string) {
        let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Email regex pattern
        if (!emailFormat.test(value)) {
            this.error.push(`${email} id is not valid`); // Invalid email error
        };
    };


    /**
    * Checks if the value is a valid UUID.
    * @function isUUID
    * @param {string} name - The name of the field.
    * @param {string} value - The UUID string to validate.
    */
    isUUID(name: string, value: string) {
        let uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidFormat.test(value)) {
            this.error.push(`${name} should be a valid UUID`);
        };
    };
};


export default new Validate(); // Export an instance of the Validate class