/**
 * Validates an email format using regex.
 * @param email - Email string to validate.
 * @returns true if valid, false if invalid.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


/**
 * Extracts values enclosed in double curly braces from a string.
 * @param str - The input string containing values wrapped in double curly braces (e.g., "{{value1}}").
 * @returns An array of strings, each representing a value found inside curly braces, with the braces removed.
 */
export function getValuesInCurlyBraces(str: string) {
    let regExp = /\{{.*?\}}/g
    let matches = str.match(regExp);
    let match_list = [];

    for (let match in matches) {
        let val = matches[+match].replace(/{{|}}/g, '');
        match_list.push(val);
    };

    return match_list;
};