import {signup, getCities} from "../services/api.js";
import {setAuthData} from "../utils/storage.js";
import {isValidEmail, isValidPhone, validatePassword, isValidName
}from "../utils/validators.js";

document.addEventListener("DOMContentLoaded", () => {
    initContactToggle();
    loadCities();
    initSignupForm();
});

/**
 * Email / Phone toggle
 */
function initContactToggle() {
    const emailOption = document.getElementById("email-option");
    const phoneOption = document.getElementById("phone-option");

    const emailGroup = document.getElementById("email-group");
    const phoneGroup = document.getElementById("phone-group");

    if (!emailOption || !phoneOption) return;
    emailOption.addEventListener("click", () => {
        emailOption.classList.add("active-email");
        emailOption.classList.remove("active-phone");

        phoneOption.classList.remove("active-phone");
        phoneOption.classList.remove("active-email");

        emailGroup.classList.remove("hidden");
        phoneGroup.classList.add("hidden");
    });

    phoneOption.addEventListener("click", () => {
        phoneOption.classList.add("active-phone");
        phoneOption.classList.remove("active-email");

        emailOption.classList.remove("active-email");
        emailOption.classList.remove("active-phone");

        phoneGroup.classList.remove("hidden");
        emailGroup.classList.add("hidden");

    });
}

async function loadCities() {
    const citySelect = document.getElementById("city");

    if (!citySelect) return;

    try {
        citySelect.innerHTML = `<option value="">Loading cities...</option>`;

        const cities = await getCities();

        citySelect.innerHTML = `<option value="">Select your city</option>`;

        cities.forEach(city => {
            const option = document.createElement("option");

            option.value = city.city_id;
            option.textContent = city.name;

            citySelect.appendChild(option);
        });

    }catch (error){
        console.error("Failed to load cities:", error);

        citySelect.innerHTML = `<option value="">Failed to load cities</option>`;
    }
}

/**
 * Signup form submit
 */
function initSignupForm() {
    const form = document.getElementById("signup-form");
    if (!form) return;
    form.addEventListener("submit", handleSignup);
}

async function handleSignup(event) {
    event.preventDefault();
    const errorMessage =document.getElementById("error-message");

    try {
        const firstName =document.getElementById("first_name").value.trim();
        const lastName =document.getElementById("last_name").value.trim();
        const email =document.getElementById("email").value.trim();
        const phone =document.getElementById("phone").value.trim();
        const password =document.getElementById("password").value;
        const confirmPassword =document.getElementById("confirm-password").value;
        const cityId = document.getElementById("city").value;

        // -------------------------
        // Validation
        // -------------------------

        if (!isValidName(firstName)) {
            throw new Error("Invalid first name.");
        }
        if (!isValidName(lastName)) {
            throw new Error("Invalid last name.");
        }
        if (!email && !phone) {
            throw new Error("Email or phone number is required.");
        }
        if (email && !isValidEmail(email)) {
            throw new Error("Invalid email address.");
        }
        if (phone && !isValidPhone(phone)) {
            throw new Error("Invalid phone number.");
        }
        
        const passwordValidation =validatePassword(password);

        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }
        // -------------------------
        // Prepare Request Body
        // -------------------------

        const signupData = {
            first_name: firstName, 
            last_name: lastName, 
            email: email || null,
            phone: phone || null,
            password: password,
            city_id: cityId ? Number(cityId) : null
        };

        // -------------------------
        // API Call
        // -------------------------

        const response =await signup(signupData);

        // Save token + user

        setAuthData(response);

        errorMessage.classList.remove(
            "text-red-500"
        );

        errorMessage.classList.add(
            "text-green-500"
        );

        errorMessage.textContent ="Account created successfully.";

        setTimeout(() => {
            window.location.href ="index.html";
        }, 1000);

    } catch(error) {
        console.error("Signup error:",error);
        errorMessage.classList.remove(
            "text-green-500"
        );

        errorMessage.classList.add(
            "text-red-500"
        );

        errorMessage.textContent =error.message ||"Signup failed.";
    }
}