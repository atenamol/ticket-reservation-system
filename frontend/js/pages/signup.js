/**
 * Signup Page Logic
 */

import { signup } from "../services/api.js";
import { setAuthData } from "../utils/storage.js";
import {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidName
} from "../utils/validators.js";


document.addEventListener("DOMContentLoaded", () => {

    initContactToggle();
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


    const errorMessage =
        document.getElementById("error-message");


    try {


        const firstName =
            document.getElementById("first_name")
            .value
            .trim();


        const lastName =
            document.getElementById("last_name")
            .value
            .trim();


        const email =
            document.getElementById("email")
            .value
            .trim();


        const phone =
            document.getElementById("phone")
            .value
            .trim();


        const password =
            document.getElementById("password")
            .value;


        const confirmPassword =
            document.getElementById("confirm-password")
            .value;


        const city =
            document.getElementById("city")
            .value;



        // -------------------------
        // Validation
        // -------------------------


        if (!isValidName(firstName)) {
            throw new Error(
                "Invalid first name."
            );
        }


        if (!isValidName(lastName)) {
            throw new Error(
                "Invalid last name."
            );
        }



        if (!email && !phone) {
            throw new Error(
                "Email or phone number is required."
            );
        }



        if (email && !isValidEmail(email)) {

            throw new Error(
                "Invalid email address."
            );

        }



        if (phone && !isValidPhone(phone)) {

            throw new Error(
                "Invalid phone number."
            );

        }



        const passwordValidation =
            validatePassword(password);


        if (!passwordValidation.isValid) {

            throw new Error(
                passwordValidation.message
            );

        }



        if (password !== confirmPassword) {

            throw new Error(
                "Passwords do not match."
            );

        }



        // -------------------------
        // Prepare Request Body
        // -------------------------


        const signupData = {

            first_name: firstName,

            last_name: lastName,

            password: password

        };



        if (email) {
            signupData.email = email;
        }


        if (phone) {
            signupData.phone = phone;
        }


        if (city) {

            signupData.city_id =
                Number(city);

        }



        // -------------------------
        // API Call
        // -------------------------


        const response =
            await signup(signupData);



        // Save token + user

        setAuthData(response);



        errorMessage.classList.remove(
            "text-red-500"
        );

        errorMessage.classList.add(
            "text-green-500"
        );


        errorMessage.textContent =
            "Account created successfully.";



        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1000);



    } catch(error) {


        console.error(
            "Signup error:",
            error
        );


        errorMessage.classList.remove(
            "text-green-500"
        );

        errorMessage.classList.add(
            "text-red-500"
        );


        errorMessage.textContent =
            error.message ||
            "Signup failed.";

    }

}