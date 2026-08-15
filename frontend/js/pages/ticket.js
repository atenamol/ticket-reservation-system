import {
    getTicketDetail,
    searchTickets
} from "../services/api.js";

import { getAccessToken } from "../utils/storage.js";


let currentTicket = null;
let matchTickets = [];
let selectedTicket = null;


document.addEventListener("DOMContentLoaded", () => {
    initTicketPage();
});


async function initTicketPage() {
    setupReportButton();
    setupCheckoutButton();

    const ticketId = getTicketIdFromURL();

    if (!ticketId) {
        showPageError("No Ticket ID was provided.");
        return;
    }

    try {
        setLoading(true);

        /*
         * Get the exact ticket that opened this page.
         */
        currentTicket = await getTicketDetail(ticketId);

        if (!currentTicket) {
            throw new Error("Ticket not found.");
        }

        /*
         * Render real match information.
         */
        renderMatchInfo(currentTicket);

        await loadMatchCategories(currentTicket);

    } catch (error) {
        console.error("Failed to load ticket page:", error);

        showPageError(
            error.message || "Failed to load ticket information."
        );

    } finally {
        setLoading(false);
    }
}


function getTicketIdFromURL() {
    const params = new URLSearchParams(window.location.search);

    const rawTicketId = params.get("ticketId") || params.get("id");

    if (!rawTicketId) {
        return null;
    }

    const ticketId = Number(rawTicketId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
        return null;
    }

    return ticketId;
}


function renderMatchInfo(ticket) {
    setText(
        "match-sport-badge",
        ticket.sport_type || "Sport"
    );

    setText(
        "match-league",
        ticket.league_name || "League"
    );

    setText(
        "match-home-team",
        ticket.home_team || "Home Team"
    );

    setText(
        "match-away-team",
        ticket.away_team || "Away Team"
    );

    setText(
        "match-date",
        formatDate(ticket.match_date)
    );

    setText(
        "match-venue",
        ticket.stadium_or_hall_name ||
        ticket.venue_name ||
        "Venue"
    );

    setText(
        "match-city",
        ticket.city_name || "City"
    );

    setText(
        "match-address",
        ticket.address || "Address unavailable"
    );

    setText(
        "match-id-display",
        ticket.match_id ?? "—"
    );
}


/* ============================================================
   LOAD CATEGORIES FOR THE SAME MATCH
============================================================ */

async function loadMatchCategories(ticket) {
    const container =
        document.getElementById("ticket-zones-container");

    if (!container) {
        throw new Error(
            "Ticket categories container not found."
        );
    }

    const matchDate = getDateOnly(ticket.match_date);

    /*
     * Search available tickets using information shared
     * by the match.
     */
    const results = await searchTickets({
        sport_type: ticket.sport_type,
        city_id: ticket.city_id,
        venue_id: ticket.venue_id,
        date_from: matchDate,
        date_to: matchDate
    });

    /*
     * Keep ONLY tickets belonging to the exact same match.
     */
    const sameMatchTickets = (results || []).filter(
        item =>
            Number(item.match_id) === Number(ticket.match_id)
    );

    /*
     * Make sure the ticket that opened the page is included.
     */
    const hasCurrentTicket = sameMatchTickets.some(
        item =>
            Number(item.ticket_id) ===
            Number(ticket.ticket_id)
    );

    if (
        !hasCurrentTicket &&
        Number(ticket.remaining_capacity) > 0
    ) {
        sameMatchTickets.push({
            ticket_id: ticket.ticket_id,
            price: ticket.price,
            category: ticket.category,
            remaining_capacity:
                ticket.remaining_capacity,
            match_id: ticket.match_id,
            sport_type: ticket.sport_type,
            match_date: ticket.match_date,
            venue_id: ticket.venue_id,
            venue_name: ticket.venue_name,
            city_name: ticket.city_name,
            home_team: ticket.home_team,
            away_team: ticket.away_team
        });
    }

    /*
     * Remove duplicate Ticket IDs.
     */
    const uniqueTickets = Array.from(
        new Map(
            sameMatchTickets.map(
                item => [
                    Number(item.ticket_id),
                    item
                ]
            )
        ).values()
    );

    /*
     * Get full details for every category.
     */
    matchTickets = await Promise.all(
        uniqueTickets.map(async ticketItem => {
            try {
                return await getTicketDetail(
                    Number(ticketItem.ticket_id)
                );

            } catch (error) {
                console.warn(
                    `Could not load details for ticket ${ticketItem.ticket_id}`,
                    error
                );

                return ticketItem;
            }
        })
    );

    /*
     * Stable ordering.
     */
    matchTickets.sort(
        (a, b) =>
            Number(a.ticket_id) -
            Number(b.ticket_id)
    );

    renderTicketCategories(matchTickets);
}


function renderTicketCategories(tickets) {
    const container =
        document.getElementById(
            "ticket-zones-container"
        );

    if (!container) {
        return;
    }

    if (!tickets.length) {
        container.innerHTML = `
            <div
                class="bg-white rounded-3xl p-8
                       border-2 border-stone-200/90
                       shadow-sm text-center"
            >
                <p class="text-sm font-bold text-stone-600">
                    No ticket categories are currently
                    available for this match.
                </p>

                <p class="text-xs text-stone-400 mt-2">
                    Please go back and choose another ticket.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = tickets
        .map(ticket => createTicketCard(ticket))
        .join("");

    container
        .querySelectorAll("[data-ticket-id]")
        .forEach(card => {
            card.addEventListener("click", () => {
                const ticketId =
                    Number(card.dataset.ticketId);

                const ticket =
                    matchTickets.find(
                        item =>
                            Number(item.ticket_id) ===
                            ticketId
                    );

                if (!ticket) {
                    return;
                }

                if (
                    Number(
                        ticket.remaining_capacity
                    ) <= 0
                ) {
                    return;
                }

                selectTicket(ticket);
            });
        });
}


function createTicketCard(ticket) {
    const category =
        String(
            ticket.category || "normal"
        ).toLowerCase();

    const categoryConfig =
        getCategoryConfig(category);

    const capacity =
        Number(
            ticket.remaining_capacity ?? 0
        );

    const soldOut = capacity <= 0;

    const price =
        formatPrice(ticket.price);

    const amenities =
        ticket.amenities ||
        "Standard seating";

    const ticketType =
        ticket.ticket_type ||
        categoryLabel(category);

    const capacityText =
        soldOut
            ? "Sold out"
            : capacity === 1
                ? "Only 1 ticket left!"
                : `${capacity} tickets available`;

    return `
        <div
            class="ticket-card bg-white rounded-3xl p-6
                   border-2 border-stone-200/90
                   ${soldOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                   ${categoryConfig.hoverBorder}
                   shadow-sm
                   ${categoryConfig.hoverShadow}
                   flex flex-col sm:flex-row
                   sm:items-center justify-between
                   gap-6 group relative overflow-hidden"
            data-ticket-id="${escapeHTML(
                String(ticket.ticket_id)
            )}"
        >

            <div
                class="absolute top-0 right-0
                       w-2 h-full
                       ${categoryConfig.bar}"
            ></div>

            <div class="space-y-2.5 max-w-sm">

                <!-- Category -->
                <div class="flex items-center gap-2 flex-wrap">

                    <h3
                        class="font-oswald font-bold
                               text-2xl text-stone-900
                               ${categoryConfig.hoverText}
                               transition"
                    >
                        ${escapeHTML(
                            categoryLabel(category)
                        )}
                    </h3>

                    <span
                        class="px-2.5 py-0.5 rounded-md
                               text-[10px] font-black
                               ${categoryConfig.badge}
                               uppercase tracking-wide"
                    >
                        ${escapeHTML(ticketType)}
                    </span>

                </div>

                <!-- Ticket ID -->
                <p
                    class="text-xs font-bold
                           text-stone-400 font-mono"
                >
                    Ticket ID:
                    #${escapeHTML(
                        String(ticket.ticket_id)
                    )}
                </p>

                <!-- Amenities -->
                <p
                    class="text-xs text-stone-500
                           leading-relaxed"
                >
                    <strong class="text-stone-700">
                        Amenities:
                    </strong>

                    ${escapeHTML(amenities)}
                </p>

                <!-- Capacity -->
                <div
                    class="inline-flex items-center
                           gap-2 px-3 py-1 rounded-xl
                           ${categoryConfig.capacityBg}
                           border
                           ${categoryConfig.capacityBorder}
                           ${categoryConfig.capacityText}
                           text-xs font-bold"
                >

                    <span class="relative flex h-2.5 w-2.5">

                        ${
                            soldOut
                                ? `
                                    <span
                                        class="relative inline-flex
                                               rounded-full h-2.5 w-2.5
                                               bg-stone-400"
                                    ></span>
                                `
                                : `
                                    <span
                                        class="animate-ping
                                               absolute inline-flex
                                               h-full w-full
                                               rounded-full
                                               ${categoryConfig.dot}
                                               opacity-75"
                                    ></span>

                                    <span
                                        class="relative inline-flex
                                               rounded-full
                                               h-2.5 w-2.5
                                               ${categoryConfig.dotSolid}"
                                    ></span>
                                `
                        }

                    </span>

                    <span>
                        ${capacityText}
                    </span>

                </div>

            </div>


            <!-- Price -->
            <div
                class="flex sm:flex-col
                       items-center sm:items-end
                       justify-between sm:justify-center
                       border-t sm:border-0
                       border-stone-100
                       pt-4 sm:pt-0
                       gap-2 shrink-0"
            >

                <span
                    class="font-oswald text-3xl
                           font-bold
                           ${categoryConfig.priceText}"
                >
                    ${price}
                </span>

                <span
                    class="selection-indicator
                           text-xs font-bold
                           text-stone-400
                           bg-stone-100
                           px-3 py-1.5
                           rounded-xl transition"
                >
                    ${
                        soldOut
                            ? "Sold Out"
                            : "Click to Select"
                    }
                </span>

            </div>

        </div>
    `;
}


/* ============================================================
   SELECT CATEGORY
============================================================ */

function selectTicket(ticket) {
    selectedTicket = ticket;

    /*
     * Clear previous selection.
     */
    document
        .querySelectorAll("[data-ticket-id]")
        .forEach(card => {

            card.classList.remove(
                "ring-2",
                "ring-[#80B6E9]",
                "border-[#80B6E9]"
            );

            const indicator =
                card.querySelector(
                    ".selection-indicator"
                );

            if (indicator) {
                indicator.textContent =
                    "Click to Select";
            }
        });

    /*
     * Highlight selected category.
     */
    const selectedCard =
        document.querySelector(
            `[data-ticket-id="${ticket.ticket_id}"]`
        );

    if (selectedCard) {

        selectedCard.classList.add(
            "ring-2",
            "ring-[#80B6E9]",
            "border-[#80B6E9]"
        );

        const indicator =
            selectedCard.querySelector(
                ".selection-indicator"
            );

        if (indicator) {
            indicator.textContent =
                "Selected";
        }
    }

    updateSummary();
}


/* ============================================================
   SUMMARY
============================================================ */

function updateSummary() {
    const items =
        document.getElementById(
            "summary-items"
        );

    const total =
        document.getElementById(
            "summary-total"
        );

    const mobileTotal =
        document.getElementById(
            "summary-total-mobile"
        );

    if (!selectedTicket) {

        if (items) {
            items.textContent =
                "0 Tickets Selected";
        }

        if (total) {
            total.textContent =
                "$0.00";
        }

        if (mobileTotal) {
            mobileTotal.textContent =
                "$0.00";
        }

        disableCheckoutButton();

        return;
    }

    const price =
        Number(
            selectedTicket.price || 0
        );

    if (items) {
        items.textContent =
            "1 Ticket Selected";
    }

    if (total) {
        total.textContent =
            formatPrice(price);
    }

    if (mobileTotal) {
        mobileTotal.textContent =
            formatPrice(price);
    }

    enableCheckoutButton();
}


/* ============================================================
   CHECKOUT BUTTON STATE
============================================================ */

function enableCheckoutButton() {
    const button =
        document.getElementById(
            "btn-proceed-checkout"
        );

    if (!button) {
        return;
    }

    button.disabled = false;

    button.classList.remove(
        "bg-stone-200",
        "text-stone-400",
        "cursor-not-allowed"
    );

    button.classList.add(
        "bg-[#F69664]",
        "hover:bg-[#e8814d]",
        "text-white",
        "cursor-pointer"
    );
}


function disableCheckoutButton() {
    const button =
        document.getElementById(
            "btn-proceed-checkout"
        );

    if (!button) {
        return;
    }

    button.disabled = true;

    button.classList.remove(
        "bg-[#F69664]",
        "hover:bg-[#e8814d]",
        "text-white",
        "cursor-pointer"
    );

    button.classList.add(
        "bg-stone-200",
        "text-stone-400",
        "cursor-not-allowed"
    );
}


/* ============================================================
   CHECKOUT
============================================================ */

function setupCheckoutButton() {
    const button =
        document.getElementById(
            "btn-proceed-checkout"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        handleProceedToCheckout
    );
}


function handleProceedToCheckout() {

    if (!selectedTicket) {
        return;
    }

    /*
     * Checkout page belongs to another part of the project.
     *
     * Contract:
     * We only send the selected Ticket ID.
     */
    const ticketId =
        Number(
            selectedTicket.ticket_id
        );

    if (
        !Number.isInteger(ticketId) ||
        ticketId <= 0
    ) {
        alert("Invalid Ticket ID.");
        return;
    }

    /*
     * Ticket ID is passed to Checkout.
     */
    const params =
        new URLSearchParams({
            ticketId: String(ticketId)
        });

    window.location.href =
        `./checkout.html?${params.toString()}`;
}


/* ============================================================
   REPORT ISSUE
============================================================ */

function setupReportButton() {
    const button =
        document.getElementById(
            "btn-report-ticket"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {
            /*
             * Report page asks the user to manually
             * enter the Ticket ID.
             */
            window.location.href =
                "./report.html";
        }
    );
}


/* ============================================================
   LOADING
============================================================ */

function setLoading(isLoading) {
    const loading =
        document.getElementById(
            "ticket-loading"
        );

    if (!loading) {
        return;
    }

    loading.classList.toggle(
        "hidden",
        !isLoading
    );
}


/* ============================================================
   ERROR
============================================================ */

function showPageError(message) {
    const container =
        document.getElementById(
            "ticket-zones-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div
            class="bg-white rounded-3xl p-8
                   border-2 border-red-100
                   shadow-sm text-center"
        >

            <p
                class="text-sm font-bold
                       text-red-600"
            >
                Unable to load ticket
            </p>

            <p
                class="text-xs text-stone-500
                       mt-2"
            >
                ${escapeHTML(message)}
            </p>

            <a
                href="./search.html"
                class="inline-block mt-5
                       bg-[#80B6E9]
                       hover:bg-[#4A90E2]
                       text-white font-bold text-xs
                       px-5 py-2.5 rounded-xl
                       transition"
            >
                Back to Search
            </a>

        </div>
    `;
}


/* ============================================================
   CATEGORY STYLE CONFIG
============================================================ */

function getCategoryConfig(category) {

    switch (category) {

        case "vip":
            return {
                bar: "bg-emerald-400",
                hoverBorder:
                    "hover:border-emerald-400",
                hoverShadow:
                    "hover:shadow-glow-emerald",
                hoverText:
                    "group-hover:text-emerald-600",
                badge:
                    "bg-emerald-100 text-emerald-800",
                capacityBg:
                    "bg-emerald-50",
                capacityBorder:
                    "border-emerald-200/80",
                capacityText:
                    "text-emerald-900",
                dot:
                    "bg-emerald-400",
                dotSolid:
                    "bg-emerald-500",
                priceText:
                    "text-emerald-900"
            };

        case "special":
            return {
                bar: "bg-orange-400",
                hoverBorder:
                    "hover:border-orange-400",
                hoverShadow:
                    "hover:shadow-glow-orange",
                hoverText:
                    "group-hover:text-orange-500",
                badge:
                    "bg-orange-100 text-orange-800",
                capacityBg:
                    "bg-orange-50",
                capacityBorder:
                    "border-orange-200/80",
                capacityText:
                    "text-orange-900",
                dot:
                    "bg-orange-400",
                dotSolid:
                    "bg-orange-500",
                priceText:
                    "text-orange-900"
            };

        case "normal":
        default:
            return {
                bar: "bg-[#80B6E9]",
                hoverBorder:
                    "hover:border-[#80B6E9]",
                hoverShadow:
                    "hover:shadow-glow-blue",
                hoverText:
                    "group-hover:text-[#80B6E9]",
                badge:
                    "bg-sky-100 text-sky-800",
                capacityBg:
                    "bg-sky-50",
                capacityBorder:
                    "border-sky-200/80",
                capacityText:
                    "text-sky-900",
                dot:
                    "bg-sky-400",
                dotSolid:
                    "bg-sky-500",
                priceText:
                    "text-sky-900"
            };
    }
}


function categoryLabel(category) {

    switch (category) {

        case "vip":
            return "VIP Section";

        case "special":
            return "Special / Fan Zone";

        case "normal":
            return "Normal Tribune";

        default:
            return (
                category.charAt(0).toUpperCase() +
                category.slice(1)
            );
    }
}


/* ============================================================
   GENERAL HELPERS
============================================================ */

function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "—";
    }
}


function getDateOnly(value) {

    if (!value) {
        return null;
    }

    return String(value).slice(0, 10);
}


function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatPrice(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "$0.00";
    }

    return `$${number.toFixed(2)}`;
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}