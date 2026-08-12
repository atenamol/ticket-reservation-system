// frontend/js/pages/reset-password.js

import { resetPassword } from "../services/api.js";
import { validatePassword } from "../utils/validators.js";


// =========================
// Page Init
// =========================

document.addEventListener("DOMContentLoaded", () => {
    initResetPasswordPage();
});


// =========================
// Initialize Reset Password
// =========================

function initResetPasswordPage() {

    const form = document.getElementById("resetPasswordForm");
    const contactInput = document.getElementById("contact");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const errorMessage = document.getElementById("error-message");
    const submitButton = form?.querySelector('button[type="submit"]');


    // -------------------------
    // Check required elements
    // -------------------------

    if (
        !form ||
        !contactInput ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !errorMessage ||
        !submitButton
    ) {
        console.error("Reset Password: Required HTML elements not found.");
        return;
    }


    // -------------------------
    // Get reset data
    // -------------------------

    const resetContact = sessionStorage.getItem("reset_contact");
    const resetUserId = sessionStorage.getItem("reset_user_id");

    console.log("Reset contact:", resetContact);
    console.log("Reset user ID:", resetUserId);

    // -------------------------
    // Make sure OTP flow exists
    // -------------------------

    if (!resetContact || !resetUserId) {

        showError(
            "Your password reset session has expired. Please request a new verification code."
        );

        setTimeout(() => {
            window.location.href = "send_otp.html?mode=reset";
        }, 2000);

        return;
    }


    // -------------------------
    // Show contact
    // -------------------------

    contactInput.value = resetContact;
    contactInput.setAttribute("value", resetContact);
    contactInput.readOnly = true;

    console.log("Contact input value:", contactInput.value);

    // =========================
    // Form Submit
    // =========================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        hideError();


        // -------------------------
        // Get values
        // -------------------------

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;


        // -------------------------
        // Validate password
        // -------------------------

        if (!validatePassword(newPassword)) {

            showError(
                "Password must be 8-128 characters long, contain at least one uppercase letter, one lowercase letter, and one number, and must not contain spaces."
            );

            return;
        }


        // -------------------------
        // Confirm password
        // -------------------------

        if (newPassword !== confirmPassword) {

            showError("Passwords do not match.");

            return;
        }


        // -------------------------
        // Disable button
        // -------------------------

        setLoading(true);


        try {

            // =========================
            // Reset Password API
            // =========================

            const response = await resetPassword({
                user_id: Number(resetUserId),
                new_password: newPassword,
                confirm_password: confirmPassword
            });


            // -------------------------
            // Success
            // -------------------------

            console.log("Password reset successfully:", response);


            // Remove temporary reset data
            sessionStorage.removeItem("reset_contact");
            sessionStorage.removeItem("reset_user_id");


            submitButton.innerHTML = "✓ Password Reset!";


            // Redirect to login
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);


        } catch (error) {

            console.error("Reset Password Error:", error);


            // -------------------------
            // Backend error
            // -------------------------

            const message =
                error?.message ||
                "Password reset failed. Please try again.";

            showError(message);


            // Enable button again
            setLoading(false);
        }

    });


    // =========================
    // Helper Functions
    // =========================

    function showError(message) {

        errorMessage.textContent = message;
        errorMessage.classList.add("show");
    }


    function hideError() {

        errorMessage.textContent = "";
        errorMessage.classList.remove("show");
    }


    function setLoading(isLoading) {

        submitButton.disabled = isLoading;

        if (isLoading) {

            submitButton.innerHTML = `
                <span class="inline-flex items-center justify-center gap-2">
                    <i class="bi bi-arrow-repeat animate-spin"></i>
                    Please wait...
                </span>
            `;

        } else {

            submitButton.textContent = "Reset Password";
        }
    }

}