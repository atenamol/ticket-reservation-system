import {getMyReservations, cancelMyReservation, payReservation}from "../services/api.js";
import {getAccessToken} from "../utils/storage.js";

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const emptyState = document.getElementById("empty-state");
const reservationsContainer = document.getElementById("reservations-container");
const reservationsList = document.getElementById("reservations-list");
const reservationCount = document.getElementById("reservation-count");
const reservationTemplate = document.getElementById("reservation-card-template");
const messageBox = document.getElementById("reservation-message");

// Cancel Modal
const cancelModal = document.getElementById("cancel-modal");
const cancelModalClose = document.getElementById("cancel-modal-close");
const cancelModalConfirm = document.getElementById("cancel-modal-confirm");

// Currently selected reservation
let selectedReservationId = null;

// Countdown timers
const countdownTimers = new Map();

// Page Init
document.addEventListener("DOMContentLoaded", initReservationsPage);

// Initialize Page
async function initReservationsPage() {
    // User must be logged in
    const token = getAccessToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    setupModalEvents();
    await loadReservations();
}

// Load Reservations
async function loadReservations() {
    showLoading();

    hideError();
    hideEmpty();
    hideReservations();

    try {
        const reservations = await getMyReservations();

        console.log( "My reservations:", reservations);
        const list = normalizeReservations(reservations);
        updateReservationCount(list.length);
        if (list.length === 0) {
            showEmpty();
            return;
        }
        renderReservations(list);
        showReservations();
    }catch (error){
        console.error("Failed to load reservations:", error);
        showError(error.message || "Failed to load reservations.");
    }finally{
        hideLoading();
    }
}

// Normalize API Response
function normalizeReservations(data) {
    // Backend normally returns a list directly
    if (Array.isArray(data)) {
        return data;
    }

    // Safety if backend wraps list
    if (Array.isArray(data?.reservations)) {
        return data.reservations;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
}

// Render Reservations
function renderReservations(reservations) {
    reservationsList.innerHTML = "";
    // Clear old timers
    countdownTimers.forEach(timer => clearInterval(timer));
    countdownTimers.clear();

    reservations.forEach(reservation => {
            const card = createReservationCard(reservation);
            reservationsList.appendChild(card);
        }
    );
}

// Create Reservation Card
function createReservationCard(reservation) {
    const fragment = reservationTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".reservation-card");

    // Data Fields
    setField(card, "sport", reservation.sport_type || "Sport");
    setField(card, "home-team", reservation.home_team || "Home Team");
    setField(card, "away-team", reservation.away_team || "Away Team");
    setField(card, "ticket-id", reservation.ticket_id ?? "—");
    setField(card, "category", formatCategory(reservation.category));
    setField(card, "price", formatPrice(reservation.price));
    setField(card, "reservation-id", reservation.reservation_id ?? "—");
    setField(card, "match-date", formatDate(reservation.match_date));

    // Status
    const statusElement = card.querySelector('[data-field="status"]');
    setStatus(statusElement, reservation.status);

    // Countdown
    const countdownElement = card.querySelector('[data-field="countdown"]');
    const expirationContainer = card.querySelector("[data-expiration-container]");
    if (reservation.expires_at && reservation.status === "reserved") {
        startCountdown(countdownElement, expirationContainer, 
            reservation.expires_at,reservation.reservation_id);
    } else {
        expirationContainer?.classList.add("hidden");
    }

    // Actions
    const payButton = card.querySelector('[data-action="pay"]');
    const cancelButton = card.querySelector('[data-action="cancel"]');
    payButton.addEventListener("click",() => handlePay(reservation));
    cancelButton.addEventListener("click", () => openCancelModal(reservation.reservation_id));

    // Store reservation id
    card.dataset.reservationId = reservation.reservation_id;
    return fragment;
}

// Set Field
function setField(card, field, value) {
    const element = card.querySelector(`[data-field="${field}"]`);
    if (element) {
        element.textContent = value;
    }
}

// Format Sport
function formatCategory(category) {
    if (!category) {
        return "—";
    }
    return String(category).charAt(0).toUpperCase() + 
            String(category).slice(1).toLowerCase();
}

// Format Price
function formatPrice(price) {
    if (price === null || price === undefined) {
        return "—";
    }

    const number = Number(price);
    if (Number.isNaN(number)) {
        return price;
    }

    return number.toLocaleString(
        "en-US"
    );
}

// Format Date
function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// Status UI
function setStatus(element, status) {
    if (!element) {
        return;
    }
    const normalized = String(status || "").toLowerCase();

    element.classList.remove("status-reserved", "status-paid", "status-cancelled");

    if (normalized === "reserved") {
        element.textContent = "Reserved";
        element.classList.add("status-reserved");
    } else if (normalized === "paid") {
        element.textContent ="Paid";
        element.classList.add("status-paid");
    } else if (normalized === "cancelled") {
        element.textContent ="Cancelled";
        element.classList.add("status-cancelled");
    } else {
        element.textContent =status || "Unknown";
    }
}

// Countdown
function startCountdown(element, container, expiresAt, reservationId) {
    const expirationTime = new Date(expiresAt).getTime();

    if (Number.isNaN(expirationTime)) {
        element.textContent = "--:--";
        return;
    }

    function updateCountdown() {
        const now =Date.now();
        const remaining =expirationTime - now;

        if (remaining <= 0) {
            element.textContent = "Expired";
            container.classList.remove(
                "bg-orange-50/70",
                "border-orange-200"
            );

            container.classList.add(
                "bg-red-50",
                "border-red-200"
            );

            clearInterval(countdownTimers.get(reservationId));
            countdownTimers.delete(reservationId);

            // Reload reservations
            // after expiration
            setTimeout(() => loadReservations(),1000);
            return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        element.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);
    countdownTimers.set(reservationId, timer);
}

// Pay Reservation
async function handlePay(reservation) {
    if (!reservation.reservation_id) {
        showMessage("Reservation ID is missing.", "error");
        return;
    }

    const confirmed = window.confirm(`Do you want to pay ${formatPrice(reservation.price)} Toman for this reservation?`);
    if (!confirmed) {
        return;
    }
    const card = document.querySelector(`[data-reservation-id="${reservation.reservation_id}"]`);
    const payButton = card?.querySelector('[data-action="pay"]');
    if (payButton) {
        payButton.disabled = true;
        payButton.innerHTML = `<i class="bi bi-arrow-repeat loading-spinner"></i>Paying...`;
    }
    try {
        const paymentData = {reservation_id: reservation.reservation_id, payment_method: "card"};
        const payment = await payReservation(paymentData);
        console.log("Payment successful:", payment);

        showMessage("Payment completed successfully.", "success");
        await loadReservations();
    } catch (error) {
        console.error("Payment failed:", error);
        showMessage(error.message || "Payment failed.", "error");
        if (payButton) {
            payButton.disabled = false;
            payButton.innerHTML = `<i class="bi bi-credit-card"></i>Pay`;
        }
    }
}

// Cancel Modal
function openCancelModal(reservationId) {
    selectedReservationId = reservationId;
    cancelModal.classList.remove("hidden");
    cancelModal.classList.add("flex");
}

function closeCancelModal() {
    selectedReservationId =null;
    cancelModal.classList.add("hidden");
    cancelModal.classList.remove("flex");
}

// Modal Events
function setupModalEvents() {
    cancelModalClose.addEventListener("click", closeCancelModal);
    cancelModalConfirm.addEventListener("click", handleCancel);
    cancelModal.addEventListener("click",
        event => {
            if (event.target === cancelModal) {
                closeCancelModal();
            }
        }
    );
}

// Cancel Reservation
async function handleCancel() {
    if (!selectedReservationId) {
        return;
    }
    const reservationId = selectedReservationId;
    cancelModalConfirm.disabled = true;
    cancelModalConfirm.textContent = "Cancelling...";

    try {
        await cancelMyReservation(reservationId);
        closeCancelModal();
        showMessage("Reservation cancelled successfully.", "success");
        await loadReservations();
    } catch (error) {
        console.error("Cancellation failed:", error);
        showMessage(error.message || "Failed to cancel reservation.", "error");
    } finally {
        cancelModalConfirm.disabled = false;
        cancelModalConfirm.textContent = "Yes, Cancel";
    }
}

// UI States
function showLoading() {
    loadingState.classList.remove("hidden");
}

function hideLoading() {
    loadingState.classList.add("hidden");
}

function showReservations() {
    reservationsContainer.classList.remove("hidden");
}

function hideReservations() {
    reservationsContainer.classList.add("hidden");
}

function showEmpty() {
    emptyState.classList.remove("hidden");
}

function hideEmpty() {
    emptyState.classList.add("hidden");
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove("hidden");
}

function hideError() {
    errorState.classList.add("hidden");
}

function updateReservationCount(count) {
    reservationCount.textContent = `${count} ${count === 1 ? "ticket" : "tickets"}`;
}

// Global Message
function showMessage(message, type = "success") {
    messageBox.textContent = message;
        messageBox.className =
        "fixed top-24 left-1/2 -translate-x-1/2 z-[100] " +
        "w-[90%] max-w-md px-5 py-4 rounded-2xl shadow-xl " +
        "font-chakra font-bold text-sm text-center " +
        "transition-all duration-300";

    messageBox.classList.remove("hidden");
    
    if (type === "success") {
        messageBox.classList.add(
            "bg-emerald-100",
            "text-emerald-800",
            "border",
            "border-emerald-300"
        );
    } else {
        messageBox.classList.add(
            "bg-red-100",
            "text-red-800",
            "border",
            "border-red-300"
        );
    }
    setTimeout(() => {messageBox.classList.add("hidden");}, 3500);
}