/**
 * Protects pages that require login or specific user roles.
 */

import { getAccessToken, getUserData } from "./storage.js";


/**
 * Returns true if the user is authenticated.
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};


/**
 * Redirects unauthenticated users to the login page.
 */
export const requireAuth = () => {

    if(!isAuthenticated()){
        window.location.href = "../login.html";
        return false;
    }

    return true;
};


/**
 * Prevents authenticated users from accessing
 * login and signup pages.
 */
export const redirectIfAuthenticated = () => {

    if(isAuthenticated()){
        window.location.href = "../index.html";
    }

};


/**
 * Returns true if the current user is an admin.
 */
export const isAdmin = () => {

    const user = getUserData();
    return user?.role === "admin";

};


/**
 * Allows access only to administrators.
 * Redirects non-admin users to the home page.
 */
export const requireAdmin = () => {

    if(!requireAuth()){
        return false;
    }

    if(!isAdmin()){

        alert("You do not have permission to access this page.");

        window.location.href = "../index.html";
        return false;
    }

    return true;

};