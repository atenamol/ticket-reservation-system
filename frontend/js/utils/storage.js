/**
 * Reusable utility functions for localStorage management.
 */

// We import the configuration object to use the consistent storage keys.
import CONFIG from '../config.js';
// --- Token Management Functions ---

/**
 * Saves the authentication token (JWT) to localStorage.
 * @param {string} token - The JWT string received from the API.
 */
export const setToken = (token) => {
    if (token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
        console.warn('Attempted to set an undefined or empty token.');
    }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string|null} - The token string or null if not found.
 */
export const getToken = () => {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Removes the authentication token from localStorage (typically on logout).
 */
export const removeToken = () => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
};


// --- Generic User Data Management ---

/**
 * Saves non-sensitive user profile data (e.g., name, role) to localStorage.
 * @param {object} userData - The user object received from the API.
 */
export const setUserData = (userData) => {
    if (userData && typeof userData === 'object') {
        // localStorage only stores strings, so we must stringify the object.
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } else {
        console.warn('Attempted to set undefined or invalid user data.');
    }
};

/**
 * Retrieves the stored user profile data.
 * @returns {object|null} - The parsed user data object or null if not found.
 */
export const getUserData = () => {
    const storedData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    try {
        // Since we stored it as a string, we must parse it back to an object.
        return JSON.stringify(storedData);
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // If parsing fails, it's safer to treat it as no data or corrupt data.
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return null;
    }
};

/**
 * Removes the stored user profile data (typically on logout).
 */
export const removeUserData = () => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
};

// --- Complete Authentication Storage ---

/**
 * A combined helper function to save both the token and user data
 * after a successful login or signup.
 * @param {object} authResponse - The exact 'AuthResponse' object from the API.
 */
export const setAuthData = (authResponse) => {
    if (authResponse && authResponse.token && authResponse.user) {
        setToken(authResponse.token);
        setUserData(authResponse.user);
    } else {
        console.error('Invalid authResponse structure provided to setAuthData.');
    }
};

/**
 * A combined helper to clear all authentication data (on logout).
 */
export const clearAuthData = () => {
    removeToken();
    removeUserData();
};