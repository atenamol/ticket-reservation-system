import {getProfile, updateProfile, getCities}from "../services/api.js";
import {getUserData, setUserData}from "../utils/storage.js";
import {isValidEmail, isValidPhone}from "../utils/validators.js";

document.addEventListener("DOMContentLoaded", () => {initProfilePage();});

// Initialize Profile Page
async function initProfilePage() {

    const upload = document.getElementById("profile-upload");
    const image = document.getElementById("profile-image");

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const cityInput = document.getElementById("city");

    const userNameDisplay = document.getElementById("user-name");
    const saveBtn = document.getElementById("save-btn");

    const labelFirst = document.getElementById("label-first-name");
    const labelLast = document.getElementById("label-last-name");
    const labelEmail = document.getElementById("label-email");
    const labelPhone = document.getElementById("label-phone");
    const labelCity = document.getElementById("label-city");

    // Profile Image Preview    
    upload.addEventListener("change", () => {

        const file = upload.files[0];

        if (!file)return;
        if (!file.type.startsWith("image/")){
            alert("Please select a valid image.");
            upload.value = "";
            return;
        }
        image.src = URL.createObjectURL(file);
    });

    // Load Profile
    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="bi bi-hourglass-split"></i>Loading...`;

        const [profile, cities] = await Promise.all([getProfile(), getCities()]);
    
        fillCities(cities);
        fillProfileForm(profile);
    }catch (error){
        console.error("Failed to load profile:", error);
        const cachedUser = getUserData();

        if(cachedUser){
            fillProfileForm(cachedUser);
        }else{
            alert("Failed to load profile information.");
        }

    }finally{
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="bi bi-check-circle"></i>Save Changes`;
    }

    // Save Profile
    saveBtn.addEventListener("click", saveChanges);
    
    // Label Animations
    setupLabelZoom(firstNameInput, labelFirst);
    setupLabelZoom(lastNameInput, labelLast);
    setupLabelZoom(emailInput, labelEmail);
    setupLabelZoom(phoneInput, labelPhone);
    setupLabelZoom(cityInput, labelCity);
    
    // Fill Cities
    function fillCities(cities){
        cityInput.innerHTML = `<option value="">Select City</option>`;

        cities.forEach(city => {
            const option = document.createElement("option");

            option.value = city.city_id;
            option.textContent = city.name;

            cityInput.appendChild(option);
        });
    }
    
    // Fill Form
    function fillProfileForm(userData){
        const firstName = userData.first_name ?? userData.firstName ?? "";
        const lastName = userData.last_name ?? userData.lastName ?? "";
        const email = userData.email ?? "";
        const phone = userData.phone ?? "";
        const cityId = userData.city_id ?? "";

        firstNameInput.value = firstName;
        lastNameInput.value = lastName;
        emailInput.value = email;
        phoneInput.value = phone;
        cityInput.value = cityId;

        updateDisplayName(firstName, lastName);
    }
    
    // Update Display Name
    function updateDisplayName(firstName, lastName){
        const displayName = `${firstName} ${lastName}`.trim();
        userNameDisplay.textContent = displayName || "User Name";
    }
    
    // Save Changes
    async function saveChanges(){
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const cityId = cityInput.value ? Number(cityInput.value) : null;

        // Validation
        if(firstName.length < 2){
            alert("First name must contain at least 2 characters.");
            firstNameInput.focus();
            return;
        }

        if(lastName.length < 2){
            alert("Last name must contain at least 2 characters.");
            lastNameInput.focus();
            return;
        }

        if(email && !isValidEmail(email)){
            alert("Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        if(phone && !isValidPhone(phone)){
            alert("Please enter a valid Iranian phone number.");
            phoneInput.focus();
            return;
        }

        // Build Request Body
        const updateData = {
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            city_id: cityId
        };

        // Disable Button
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="bi bi-arrow-repeat"></i>Saving...`;

        try{
            const updatedUser = await updateProfile(updateData);
            // Update UI
            updateDisplayName(firstName, lastName);

            // Update Local Storage
            const oldUserData = getUserData() || {};

            setUserData({
                ...oldUserData,
                ...updatedUser,
                first_name: updatedUser?.first_name ?? firstName,
                last_name: updatedUser?.last_name ?? lastName,
                email: updatedUser?.email ?? email,
                phone: updatedUser?.phone ?? phone,
                city_id: updatedUser?.city_id ?? cityId
            });
            
            alert("Profile updated successfully.");
        }catch (error){
            console.error("Failed to update profile:", error);
            alert(error?.message || "Failed to update profile. Please try again.");
        }finally{
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class="bi bi-check-circle"></i> Save Changes`;
        }

        // Label Focus Animation
        function setupLabelZoom(input, label) {
            input.addEventListener("focus", () => {label.classList.add("label-lg");});
            input.addEventListener("blur", () => {label.classList.remove("label-lg");});

            // Keep larger label if field already has value
            if(input.value.trim()){
                label.classList.add("label-lg");
            }
        }
    }
}
