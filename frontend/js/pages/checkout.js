import {getTicketDetail, reserveTicket, payReservation}from "../services/api.js";

document.addEventListener("DOMContentLoaded", () => {initCheckoutPage();});

async function initCheckoutPage() {

    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");

    if(!reserveBtn || !payBtn){
        console.error("Checkout buttons not found.");
        return;
    }

    // Get ticket ID from URL
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get("ticket_id");

    if(!ticketId){
        showError("No ticket was selected.");
        disableActions();
        return;
    }

    // Load selected ticket

    try{
        setLoadingState(true);

        const ticket = await getTicketDetail(Number(ticketId));

        if(!ticket){
            throw new Error("Ticket not found.");
        }

        fillTicketDetails(ticket);
        updateCapacityState(ticket);

    }catch (error){
        console.error("Failed to load ticket:", error);
        showError(error?.message || "Failed to load ticket information.");
        disableActions();
    }finally{
        setLoadingState(false);
    }

    // Reserve
    reserveBtn.addEventListener("click", async () => {
        await handleReserve(Number(ticketId));
    });


    // Pay
    payBtn.addEventListener("click", async () => {
        await handlePayment(Number(ticketId));
    });
}


// Fill Ticket Information
function fillTicketDetails(ticket){
    // Sport
    setText("match-sport-badge", ticket.sport_type || "Sport");

    // League
    const leagueElement = document.getElementById("match-league");
    if(leagueElement){
        if(ticket.league_name){
            leagueElement.textContent = ticket.league_name;
            leagueElement.classList.remove("hidden");
        }else{
            leagueElement.textContent = "Match";
        }
    }

    // Teams
    setText("match-home-team", ticket.home_team || "Home Team");
    setText("match-away-team",ticket.away_team || "Away Team");

    // Date
    if(ticket.match_date){
        const formattedDate = formatDate(ticket.match_date);
        setText("match-date", formattedDate);
    }
    
    // Venue
    setText("match-venue", ticket.stadium_or_hall_name || ticket.venue_name || "Venue unavailable");
    // City
    setText("match-city", ticket.city_name || "Unknown");
    // Address
    setText("match-address", ticket.address || "Address unavailable");
    // Ticket ID
    setText("match-id-display", ticket.ticket_id ?? "—");
    // Price
    const price = ticket.price;
    setText("ticket-price", formatPrice(price));
    setText("footer-ticket-price", formatPrice(price));
    // Capacity
    updateCapacityDisplay(ticket.remaining_capacity);
    //Category
    setText("ticket-category", ticket.category || "Standard");
}

// Capacity
function updateCapacityDisplay(capacity){
    const capacityElement = document.getElementById("ticket-capacity");
    if(capacityElement){
        capacityElement.textContent = capacity ?? "—";
    }
}

function updateCapacityState(ticket){
    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");
    const footerMessage = document.getElementById("footer-capacity-message");
    const capacity = Number(ticket.remaining_capacity);

    if(!Number.isFinite(capacity) || capacity <= 0){
        reserveBtn.disabled = true;
        payBtn.disabled = true;
        reserveBtn.classList.add("opacity-50", "cursor-not-allowed");
        payBtn.classList.add("opacity-50", "cursor-not-allowed");

        if(footerMessage){
            footerMessage.textContent ="⚠️ This ticket is currently sold out.";
            footerMessage.classList.remove("hidden");
        }
        return;
    }

    if(footerMessage){
        footerMessage.classList.add("hidden");
    }
}

// Reserve Ticket
async function handleReserve(ticketId){
    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");

    try{
        setActionLoading(reserveBtn, "Reserving...");
        payBtn.disabled = true;

        const reservation =await reserveTicket({ticket_id: ticketId});
        console.log("Reservation created:", reservation);
        showSuccess(`Ticket reserved successfully. Reservation #${reservation.reservation_id}`);

        // Prevent duplicate reservation
        reserveBtn.disabled = true;
    }catch (error){
        console.error("Reservation failed:", error);
        showError(error?.message || "Failed to reserve ticket.");
        reserveBtn.disabled = false;
        payBtn.disabled = false;

    }finally{
        restoreReserveButton();
    }
}

// Payment
async function handlePayment(ticketId){
    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");

    try{
        setActionLoading(payBtn, "Processing...");
        reserveBtn.disabled = true;

        // Create reservation
        const reservation = await reserveTicket({ticket_id: ticketId});

        if(!reservation?.reservation_id){
            throw new Error("Reservation could not be created.");
        }

        // Simulated payment
        await simulatePayment();
        // Register payment in backend
        const payment = await payReservation({reservation_id: reservation.reservation_id,
            payment_method: "simulation"
            });

        console.log("Payment completed:", payment);
        
        // Success message
        showPaymentSuccess(payment, reservation);
        reserveBtn.disabled = true;
        payBtn.disabled = true;
    }catch (error){
        console.error("Payment failed:", error);
        showError(error?.message || "Payment failed. Please try again.");
        reserveBtn.disabled = false;
        payBtn.disabled = false;
    }finally{
        restorePayButton();
    }
}

// Simulated Payment
function simulatePayment(){
    return new Promise((resolve) => {setTimeout(() => {resolve();}, 800);});
}

// Payment Success
function showPaymentSuccess(payment, reservation) {
    const message = `Payment successful! Amount ${formatPrice(payment.amount)} Toman was deducted from your account.`;
    showSuccess(`${message} Reservation #${reservation.reservation_id}`);

    setTimeout(() => {window.location.href = "index.html";}, 2000);
}

// Loading State
function setLoadingState(isLoading){
    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");
    if (isLoading){
        reserveBtn.disabled = true;
        payBtn.disabled = true;
        reserveBtn.innerHTML =`<i class="bi bi-hourglass-split"></i> Loading...`;
        payBtn.innerHTML =`<i class="bi bi-hourglass-split"></i> Loading...`;
    }else{
        restoreReserveButton();
        restorePayButton();
    }
}

// Button Loading
function setActionLoading(button, text){
    button.disabled = true;
    button.innerHTML =`<i class="bi bi-arrow-repeat animate-spin"></i> ${text}`;
}

// Restore Buttons
function restoreReserveButton(){
    const button = document.getElementById("reserve-btn");
    if (!button) return;
    button.innerHTML = `<i class="bi bi-bookmark-check text-lg"></i> Reserve`;
}

function restorePayButton(){
    const button = document.getElementById("pay-btn");
    if (!button) return;
    button.innerHTML = `<i class="bi bi-credit-card text-lg"></i> Pay Now`;
}

// Disable Actions
function disableActions() {
    const reserveBtn = document.getElementById("reserve-btn");
    const payBtn = document.getElementById("pay-btn");

    if(reserveBtn)reserveBtn.disabled = true;
    if(payBtn)payBtn.disabled = true;
}

// Messages
function showSuccess(message){
    showMessage(message, "success");
}

function showError(message){
    showMessage(message, "error");
}

function showMessage(message, type){
    let messageElement = document.getElementById("checkout-message");

    if(!messageElement){
        messageElement = document.createElement("div");
        messageElement.id = "checkout-message";
        messageElement.className = "fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[90%] px-5 py-4 rounded-2xl shadow-xl font-chakra font-bold text-sm text-center transition-all duration-300";
        document.body.appendChild(messageElement);
    }

    if(type === "success"){
        messageElement.classList.remove(
            "bg-red-100",
            "text-red-700",
            "border-red-300"
        );

        messageElement.classList.add(
            "bg-emerald-100",
            "text-emerald-800",
            "border",
            "border-emerald-300"
        );
    }else{
        messageElement.classList.remove(
            "bg-emerald-100",
            "text-emerald-800",
            "border-emerald-300"
        );

        messageElement.classList.add(
            "bg-red-100",
            "text-red-700",
            "border",
            "border-red-300"
        );
    }

    messageElement.textContent = message;
    messageElement.classList.remove("hidden");

    setTimeout(() => {messageElement.classList.add("hidden");}, 4000);
}

// Utility
function setText(elementId, value){
    const element = document.getElementById(elementId);
    if(element){
        element.textContent = value ?? "—";
    }
}

function formatPrice(price){
    if (price === null || price === undefined || price === ""){
        return "—";
    }

    const number = Number(price);

    if(Number.isNaN(number)){
        return price;
    }

    return number.toLocaleString("en-US");
}

function formatDate(dateValue){
    const date = new Date(dateValue);

    if(Number.isNaN(date.getTime())){
        return dateValue;
    }

    return date.toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}
