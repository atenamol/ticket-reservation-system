/**
 * Form and input validation helper functions matching backend constraints.
 */

/**
 * Validates Iranian mobile phone numbers (Format: 09xxxxxxxxx)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone.trim());
};

/**
 * Validates email format using standard regex
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates password strength according to schema:
 * - At least 8 characters
 * - Max 128 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - No spaces allowed
 * @param {string} password
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (password.length > 128) {
        return { isValid: false, message: 'Password cannot exceed 128 characters.' };
    }
    if (/\s/.test(password)) {
        return { isValid: false, message: 'Password cannot contain spaces.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }

    return { isValid: true };
};

/**
 * Validates 6-digit OTP code
 * @param {string} otp
 * @returns {boolean}
 */
export const isValidOTP = (otp) => {
    if (!otp) return false;
    return /^\d{6}$/.test(otp.trim());
};

/**
 * Validates first/last name (min length 2, not empty after trimming)
 * @param {string} name
 * @returns {boolean}
 */
export const isValidName = (name) => {
    if (!name) return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Ensures at least one contact method (email or phone) is provided
 * @param {string} email
 * @param {string} phone
 * @returns {boolean}
 */
export const hasValidContact = (email, phone) => {
    return (email && isValidEmail(email)) || (phone && isValidPhone(phone));
};