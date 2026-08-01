/**
 * Common utility and formatting functions across the application.
 */

// --- 1. Currency & Price Formatting ---

/**
 * Formats a raw number or Decimal string into a formatted currency display.
 * @param {number|string} amount - The price amount from backend.
 * @param {string} currency - The currency label (default: 'Toman').
 * @returns {string} - Formatted string (e.g., "150,000 Toman").
 */
export const formatCurrency = (amount, currency = 'Toman') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return `0 ${currency}`;
    }
    const numericAmount = Number(amount);
    return `${numericAmount.toLocaleString('en-US')} ${currency}`;
};


// --- 2. Date & Time Formatting ---

/**
 * Formats an ISO datetime string into a readable date string.
 * @param {string|Date} dateString - ISO date from backend (e.g., "2026-08-01T10:00:00Z").
 * @returns {string} - Formatted date (e.g., "Aug 1, 2026, 10:00 AM").
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

/**
 * Formats a date into a short date-only format (e.g., "2026-08-01").
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toISOString().split('T')[0];
};


// --- 3. UI Status Badges & Capitalization ---

/**
 * Returns a CSS class name based on the entity status for visual styling.
 * @param {string} status - e.g., "approved", "rejected", "pending", "open", "closed".
 * @returns {string} - CSS class identifier.
 */
export const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-secondary';

    switch (status.toLowerCase()) {
        case 'paid':
        case 'approved':
        case 'completed':
        case 'closed':
            return 'badge-success'; // Green badge
        case 'pending':
        case 'in_progress':
        case 'reserved':
            return 'badge-warning'; // Yellow/Orange badge
        case 'cancelled':
        case 'rejected':
        case 'failed':
            return 'badge-danger'; // Red badge
        default:
            return 'badge-secondary'; // Default gray badge
    }
};

/**
 * Capitalizes snake_case or lowercase status strings for presentation.
 * @param {string} text - e.g., "in_progress" -> "In Progress"
 * @returns {string}
 */
export const formatStatusText = (text) => {
    if (!text) return '';
    return text
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


// --- 4. Text & Input Helpers ---

/**
 * Truncates long text strings with ellipses.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (str, maxLength = 50) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
};