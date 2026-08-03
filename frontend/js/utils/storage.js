// frontend/js/utils/storage.js

import CONFIG from '../config.js';

/**
 * Auth & LocalStorage helper functions.
 */

// --- Access Token Helpers ---

export const getAccessToken = () => {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN) || null;
};

export const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
    }
};

export const removeAccessToken = () => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
};

// Backwards-compatibility alias so existing imports won't break
export const getToken = getAccessToken;


// --- User Data Helpers ---

export const getUserData = () => {
    const storedData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    if (!storedData) return null;

    try {
        return JSON.parse(storedData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return null;
    }
};

export const setUserData = (userData) => {
    if (userData) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
};

export const removeUserData = () => {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
};


// --- Combined Auth Helpers ---

/**
 * Stores both access token and user data from AuthResponse.
 * @param {Object} authResponse - Response object from login/signup API containing { token: { access_token }, user }
 */
export const setAuthData = (authResponse) => {
    if (!authResponse) return;

    // Extract access_token from backend AuthResponse structure
    const token = authResponse.token?.access_token || authResponse.access_token || authResponse.token;
    const user = authResponse.user;

    if (token) setAccessToken(token);
    if (user) setUserData(user);
};

export const clearAuthData = () => {
    removeAccessToken();
    removeUserData();
};