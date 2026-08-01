import { getToken, getUserData, clearAuthData } from './utils/storage.js';
import { formatStatusText } from './utils/helpers.js';

/**
 * Initializes global application features and updates user navigation bar.
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initLogoutHandler();
});

/**
 * Dynamically updates header navigation based on login status and user role.
 */
function initNavbar() {
    const token = getToken();
    const user = getUserData();

    const authGuestLinks = document.querySelectorAll('.auth-guest-only');
    const authUserLinks = document.querySelectorAll('.auth-user-only');
    const adminLinks = document.querySelectorAll('.auth-admin-only');
    const userNameDisplay = document.getElementById('user-display-name');

    if (token && user) {
        // User is logged in
        authGuestLinks.forEach((el) => el.classList.add('hidden'));
        authUserLinks.forEach((el) => el.classList.remove('hidden'));

        if (userNameDisplay) {
            userNameDisplay.textContent = `${user.first_name || 'User'} (${formatStatusText(user.role)})`;
        }

        // Toggle Admin links if role is admin
        if (user.role === 'admin') {
            adminLinks.forEach((el) => el.classList.remove('hidden'));
        } else {
            adminLinks.forEach((el) => el.classList.add('hidden'));
        }
    } else {
        // User is logged out
        authGuestLinks.forEach((el) => el.classList.remove('hidden'));
        authUserLinks.forEach((el) => el.classList.add('hidden'));
        adminLinks.forEach((el) => el.classList.add('hidden'));
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
            // Redirect to home or login page after logout
            window.location.href = '/index.html';
        });
    });
}