import {loginWithOTP, verifyOTP, forgotPassword}from "../services/api.js";
import {setAuthData}from "../utils/storage.js";
import {isValidEmail, isValidPhone}from "../utils/validators.js";

document.addEventListener("DOMContentLoaded",() => {initOTPPage();});

// =========================
// Initialize OTP Page
// =========================

function initOTPPage(){
    const form =document.getElementById("otp-login-form");
    if(!form) return;
    const params =new URLSearchParams(window.location.search);
    const mode =params.get("mode") || "login";

    updatePageUI(mode);

    const sendButton =document.getElementById("send-code-btn");

    sendButton.addEventListener(
        "click",
        () => sendCode(mode)
    );

    form.addEventListener(
        "submit",
        (event)=>verifyCode(event,mode)
    );

}

// =========================
// Update UI based on mode
// =========================

function updatePageUI(mode){
    const subtitle =document.getElementById("subtitle");
    const footer =document.getElementById("footer-links");
    const sendButton =document.getElementById("send-code-btn");

    if(mode === "reset"){
        subtitle.textContent ="Reset Password with OTP";
        if(footer)footer.style.display ="none";

        sendButton.innerHTML ='<i class="bi bi-send me-2"></i> Get Recovery Code';
    }else{
        subtitle.textContent ="Login with OTP";
        if(footer)footer.style.display ="block";

        sendButton.innerHTML ='<i class="bi bi-send me-2"></i> Send Code';
    }
}

// =========================
// Send OTP
// =========================

async function sendCode(mode){
    try{
        const identifier =document.getElementById("identifier").value.trim();
        const contact =buildContact(identifier);
        let response;

        if(mode === "reset"){
            response =await forgotPassword(contact);
            sessionStorage.setItem("reset_contact", identifier);
        }else{
            response =await loginWithOTP(contact);
        }

        console.log("OTP response:",response);

        // نمایش OTP برای تست
        showTestOTP(response);
        showOTPSection();
    }
    catch(error){
        showError(error.message);
    }
}
// =========================
// Show OTP For Testing
// =========================

function showTestOTP(response){
    const otpBox =document.getElementById("otp-display-box");
    const otpCode =document.getElementById("otp-display-code");

    if(!otpBox || !otpCode)return;
    if(response?.message){
        const match =response.message.match(/\d{6}/);
        if(match){
            otpCode.textContent =match[0];
            otpBox.classList.add("show");
        }
    }
}

// =========================
// Verify OTP
// =========================

async function verifyCode(event, mode){
    event.preventDefault();
    try{
        const identifier =document.getElementById("identifier").value.trim();
        const otp =document.getElementById("otp-code").value.trim();
        
        if(!otp || otp.length !== 6){
            throw new Error("OTP must be 6 digits.");
        }
        
        const contact =buildContact(identifier);
        const verifyData = {...contact, otp, purpose: mode};
        const response =await verifyOTP(verifyData);

        if(mode === "login"){
            setAuthData(response);
            window.location.href ="index.html";
        }else{
            const userId = response?.user_id;

            if (!userId) {
                throw new Error("User information was not returned.");
            }
            
            sessionStorage.setItem("reset_user_id", userId);
            sessionStorage.setItem("reset_contact", identifier);
            
            window.location.href = "reset_password.html";
        }
    }
    catch(error){
        showError(error.message);
    }
}
// =========================
// Build Contact
// =========================

function buildContact(identifier){
    if(isValidEmail(identifier)){
        return {email: identifier};
    }
    if(isValidPhone(identifier)){
        return {phone: identifier};
    }
    throw new Error("Invalid email or phone number.");
}
// =========================
// Show OTP Section
// =========================

function showOTPSection(){
    const section =document.getElementById("otp-section");

    if(section){
        section.classList.add("show");
    }

    const otpInput =document.getElementById("otp-code");

    if(otpInput){otpInput.focus();}
}
// =========================
// Error Handler
// =========================

function showError(message){
    const error =document.getElementById("error-message");
    if(!error) return;

    error.textContent =message;
    error.classList.add("show");

    setTimeout(()=>{error.classList.remove("show")},5000);

}