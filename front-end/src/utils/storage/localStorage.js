/**
 * @description This function is used to set the local storage
 * @param {string} key - The key to store the value in the local storage
 * @param {any} value - The value to store in the local storage
 */
export const setLocalStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error in setting local storage ${key}: ${error}`)
    }
}

/**
 * @description This function is used to get the local storage
 * @param {string} key - The key to get the value from the local storage
 * @returns {any} The value from the local storage
 */
export const getLocalStorage = (key) => {
    try {
        const serializedValue = localStorage.getItem(key);
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error(`Error in getting local storage ${key}: ${error}`)
    }
}

/**
 * @function to remove the local storage
 * @param {string} key - The key to remove the value from the local storage
 */
export const removeLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing the local storage ${key}: ${error}`)
    }
}