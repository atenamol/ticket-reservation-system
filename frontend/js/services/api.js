/**
 * API Service
 * Handles all communication with the FastAPI backend.
 */

import CONFIG from "../config.js";
import { getAccessToken } from "../utils/storage.js";

/* ============================================================
    Internal Helpers
============================================================ */


const buildURL = (endpoint) =>
    `${CONFIG.API_BASE_URL}${endpoint}`;

/**
 * Build Authorization header
 */

const authHeaders = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}`}: {};
};

/**
 * Convert object to query string
 */
const buildQueryString = (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if(value !== undefined && value !== null && value !== ""){
            query.append(key, value);
        }
    });

    return query.toString();
};

/**
 * Generic Request Function
 */
const request = async (endpoint, 
    {method = "GET", body = null, auth = false} = {}) => {
    const headers = {"Content-Type": "application/json"};

    if(auth){
        Object.assign(headers, authHeaders());
    }

    const response = await fetch(
        `${CONFIG.API_BASE_URL}${endpoint}`,
        {method, headers, body: body ? JSON.stringify(body) : null}
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if(!response.ok){
        throw new Error(
            data?.detail || "Something went wrong."
        );
    }

    return data;
};

/* ============================================================
    Authentication
============================================================ */

export const signup = (userData) =>
    request(CONFIG.ENDPOINTS.AUTH.SIGNUP, {method: "POST", body: userData}
    );

export const loginWithPassword = (loginData) =>
    request(CONFIG.ENDPOINTS.AUTH.PASSWORD_LOGIN, 
        {method: "POST", body: loginData}
    );

export const loginWithOTP = (contactData) =>
    request(CONFIG.ENDPOINTS.AUTH.OTP_LOGIN, {method: "POST", body: contactData}
    );

export const verifyOTP = (otpData) =>
    request(CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {method: "POST", body: otpData}
    );

export const forgotPassword = (contactData) =>
    request(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {method: "POST", body: contactData});


export const resetPassword = (resetData) =>
    request(CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        {method: "POST", body: resetData});

export const updateProfile = (profileData) =>
    request(CONFIG.ENDPOINTS.AUTH.PROFILE, 
        {method: "PUT", body: profileData, auth: true}
    );

/* ============================================================
    Catalog
============================================================ */

export const getCities = () =>
    request(CONFIG.ENDPOINTS.CATALOG.CITIES);

export const getVenues = (cityId = null) => {
    const query = buildQueryString({city_id: cityId});

    return request(
        `${CONFIG.ENDPOINTS.CATALOG.VENUES}${query ? `?${query}` : ""}`
    );
};

export const searchTickets = (filters = {}) => {
    const query = buildQueryString(filters);

    return request(
        `${CONFIG.ENDPOINTS.CATALOG.TICKETS_SEARCH}?${query}`
    );
};

export const getTicketDetail = (ticketId) =>
    request(CONFIG.ENDPOINTS.CATALOG.TICKET_DETAIL(ticketId)
);

/* ============================================================
    Transactions
============================================================ */

export const reserveTicket = (reservationData) =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.RESERVE, 
        {method: "POST", body: reservationData, auth: true}
    );

export const payReservation = (paymentData) =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.PAY, 
        {method: "POST", body: paymentData, auth: true}
    );

export const getBookings = () =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.BOOKINGS, {auth: true}

    );

export const getCancellationPenalty = (reservationId) =>
    request(
        `${CONFIG.ENDPOINTS.TRANSACTIONS.PENALTY}/${reservationId}`,
        {auth: true}
    );

export const cancelReservation = (reservationData) =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.CANCEL, 
        {method: "POST", body: reservationData, auth: true}
    );

export const reportProblem = (reportData) =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.REPORT, 
        {method: "POST", body: reportData, auth: true}
    );

export const getUserReports = () =>
    request(
        CONFIG.ENDPOINTS.TRANSACTIONS.REPORTS,
        { auth: true }
    );

/* ============================================================
    Admin
============================================================ */

export const getCancellationRequests = () =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.ADMIN_CANCELLATIONS, {auth: true}
    );

export const updateCancellation = (cancelId, data) =>
    request(
        `${CONFIG.ENDPOINTS.TRANSACTIONS.ADMIN_CANCELLATIONS}/${cancelId}`,
        {method: "PATCH", body: data, auth: true}
    );

export const getReports = () =>
    request(CONFIG.ENDPOINTS.TRANSACTIONS.ADMIN_REPORTS, {auth: true}
    );

export const updateReport = (reportId, data) =>
    request(
        `${CONFIG.ENDPOINTS.TRANSACTIONS.ADMIN_REPORTS}/${reportId}`,
        {method: "PATCH", body: data, auth: true}
    );

export const getSuspiciousPayments = () =>
    request(
        CONFIG.ENDPOINTS.TRANSACTIONS.ADMIN_SUSPICIOUS_PAYMENTS,{auth: true}
    );


// =======================
// FILE UPLOAD
// =======================


export const uploadFile = async (endpoint, formData)=>{


    const token = getAccessToken();
    const headers = {};

    if(token){
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
        buildURL(endpoint),{method:"POST", headers, body:formData}
    );


    if(!response.ok){
        const error = await response.json();
        throw new Error(error.detail || "Upload failed");
    }

    return response.json();

};