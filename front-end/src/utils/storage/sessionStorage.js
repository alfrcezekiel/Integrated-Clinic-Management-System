/**
 * @description This function is used to set the session storage
 * @param {string} key - The key to store the value in the session storage
 * @param {any} value - The value to store in the session storage
 */
export const setSessionStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        sessionStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error in setting session storage ${key}: ${error}`)
    }
}

/**
 * @description This function is used to get the session storage
 * @param {string} key - The key to get the value from the session storage
 * @returns {any} The value from the session storage
 */
export const getSessionStorage = (key) => {
    try {
        const serializedValue = sessionStorage.getItem(key);
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error(`Error in getting session storage ${key}: ${error}`)
    }
}

/**
 * @function to remove the session storage
 * @param {string} key - The key to remove the value from the session storage
 */
export const removeSessionStorage = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing the session storage ${key}: ${error}`)
    }
}