import {loginWithPassword} from "../services/api.js";
import {setAuthData} from "../utils/storage.js";
import {isValidEmail, isValidPhone} from "../utils/validators.js";

document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
});

/**
 * Initialize login form
 */
function initLoginForm(){
    const form = document.getElementById("password-login-form");
    if (!form) return;
    form.addEventListener("submit", handleLogin);
}

async function handleLogin(event){
    event.preventDefault();
    const errorMessage = document.getElementById("error-message");
    try {
        const identifier = document.getElementById("identifier").value.trim();
        const password = document.getElementById("password").value;
        if(!identifier){
            throw new Error("Email or phone number is required.");
        }

        if(!password){
            throw new Error("Password is required.");
        }

        const loginData = {password};

        if(isValidEmail(identifier)){
            loginData.email = identifier;
        }
        else if(isValidPhone(identifier)){
            loginData.phone = identifier;
        }
        else{
            throw new Error("Please enter a valid email or phone number.");
        }
        const response = await loginWithPassword(loginData);
        setAuthData(response);
        errorMessage.classList.remove(
            "text-red-500"
        );
        errorMessage.classList.add(
            "text-green-500"
        );
        errorMessage.classList.add("show");
        errorMessage.textContent ="Login successful.";

        setTimeout(() => {window.location.href = "index.html";}, 1000);

    }catch (error){
        console.error("Login error:", error);
        errorMessage.classList.remove(
            "text-green-500"
        );
        errorMessage.classList.add(
            "text-red-500"
        );
        errorMessage.classList.add("show");
        errorMessage.textContent =error.message || "Login failed.";
    }
}