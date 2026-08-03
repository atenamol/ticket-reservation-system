import { getAccessToken, getUserData, clearAuthData } from './utils/storage.js';
import { formatStatusText } from './utils/helpers.js';

/**
 * Initializes global application features and updates user navigation bar.
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initLogoutHandler();
});

/**
 * Dynamically updates header navigation based on authentication status and backend roles ('spectator' | 'admin').
 */
function initNavbar() {
    const token = getAccessToken();
    const user = getUserData();

    // DOM Elements for conditional visibility
    const unauthLinks = document.querySelectorAll('.auth-unauthenticated-only');
    const authLinks = document.querySelectorAll('.auth-logged-in-only');
    const adminLinks = document.querySelectorAll('.auth-admin-only');
    const spectatorLinks = document.querySelectorAll('.auth-spectator-only');
    const userNameDisplay = document.getElementById('user-display-name');

    if (token && user) {
        // User is Authenticated (Logged in)
        unauthLinks.forEach((el) => el.classList.add('hidden'));
        authLinks.forEach((el) => el.classList.remove('hidden'));

        if (userNameDisplay) {
            userNameDisplay.textContent = `${user.first_name || 'User'} (${formatStatusText(user.role)})`;
        }

        // Role-specific navigation rules according to auth_schema.py (spectator | admin)
        if (user.role === 'admin') {
            adminLinks.forEach((el) => el.classList.remove('hidden'));
            spectatorLinks.forEach((el) => el.classList.add('hidden'));
        } else if (user.role === 'spectator') {
            adminLinks.forEach((el) => el.classList.add('hidden'));
            spectatorLinks.forEach((el) => el.classList.remove('hidden'));
        }
    } else {
        // Visitor is Unauthenticated (Logged out)
        unauthLinks.forEach((el) => el.classList.remove('hidden'));
        authLinks.forEach((el) => el.classList.add('hidden'));
        adminLinks.forEach((el) => el.classList.add('hidden'));
        spectatorLinks.forEach((el) => el.classList.add('hidden'));
    }
}

/**
 * Binds global logout button clicks.
 */
function initLogoutHandler() {
    const logoutButtons = document.querySelectorAll('.btn-logout');

    logoutButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAuthData();
            window.location.href = './index.html';
        });
    });
}