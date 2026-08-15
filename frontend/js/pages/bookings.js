import {
    getBookings,
    getTicketDetail,
    getCancellationPenalty,
    cancelMyReservation
} from "../services/api.js";


/* ============================================================
   STATE
============================================================ */

let bookings = [];
let enrichedBookings = [];

let currentFilter = "all";
let currentCancellationBooking = null;

const container =
    document.getElementById("bookings-container");

const cancelModal =
    document.getElementById("cancel-modal");

const confirmCancelButton =
    document.getElementById("confirm-cancel-btn");


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initializeBookingsPage();
});


async function initializeBookingsPage() {
    setupFilterTabs();
    setupCancellationModal();

    await loadBookings();
}


/* ============================================================
   LOAD BOOKINGS
============================================================ */

async function loadBookings() {
    showLoading();

    try {
        /*
         * Get only the current user's bookings.
         * The backend applies authentication.
         */
        bookings = await getBookings();

        if (!Array.isArray(bookings)) {
            bookings = [];
        }

        /*
         * Get complete ticket information for every booking.
         */
        enrichedBookings = await Promise.all(
            bookings.map(async booking => {
                try {
                    const ticket =
                        await getTicketDetail(
                            Number(booking.ticket_id)
                        );

                    return {
                        ...booking,
                        ticket
                    };

                } catch (error) {
                    console.error(
                        `Could not load ticket ${booking.ticket_id}`,
                        error
                    );

                    /*
                     * Keep the booking even if ticket
                     * details fail to load.
                     */
                    return {
                        ...booking,
                        ticket: null
                    };
                }
            })
        );

        renderBookings();

    } catch (error) {
        console.error(
            "Failed to load bookings:",
            error
        );

        showError(
            error.message ||
            "Could not load your bookings."
        );
    }
}


/* ============================================================
   RENDER
============================================================ */

function renderBookings() {
    if (!container) {
        return;
    }

    const filtered =
        enrichedBookings.filter(
            booking =>
                getBookingStatus(booking) ===
                currentFilter ||
                currentFilter === "all"
        );

    if (!filtered.length) {
        showEmptyState();
        return;
    }

    container.innerHTML = filtered
        .map(booking =>
            createBookingCard(booking)
        )
        .join("");

    attachBookingActions();
}


/* ============================================================
   BOOKING STATUS
============================================================ */

function getBookingStatus(booking) {
    /*
     * Backend reservation status:
     * reserved / paid / cancelled
     */

    if (booking.status === "cancelled") {
        return "cancelled";
    }

    /*
     * There is currently no attendance/used status
     * in ReservationHistoryItem.
     *
     * Therefore we do NOT fake "used".
     */

    if (hasPendingCancellation(booking)) {
        return "pending";
    }

    const matchDate =
        getMatchDate(booking);

    if (
        booking.status === "paid" &&
        matchDate &&
        matchDate.getTime() > Date.now()
    ) {
        return "upcoming";
    }

    /*
     * A paid booking whose match has already passed
     * cannot be safely called "used" because the backend
     * does not currently return attendance/check-in.
     */
    if (
        booking.status === "paid" &&
        matchDate &&
        matchDate.getTime() <= Date.now()
    ) {
        return "used";
    }

    /*
     * Reserved but not paid.
     * Keep it visible under All.
     */
    return "upcoming";
}


/* ============================================================
   PENDING CANCELLATION
============================================================ */

/*
 * The current backend does not expose the user's cancellation
 * requests through GET /transactions/bookings.
 *
 * After submitting a cancellation request, we keep the returned
 * cancellation response in memory so the current page can show
 * Pending Approval immediately.
 *
 * This is intentionally NOT persisted as fake backend data.
 */
function hasPendingCancellation(booking) {
    return (
        booking.cancellation_status ===
        "pending"
    );
}


/* ============================================================
   CREATE BOOKING CARD
============================================================ */

function createBookingCard(booking) {
    const ticket = booking.ticket || {};

    const status =
        getBookingStatus(booking);

    const sport =
        normalizeSport(
            booking.sport_type ||
            ticket.sport_type
        );

    const theme =
        getSportTheme(sport);

    const homeTeam =
        ticket.home_team ||
        "Home Team";

    const awayTeam =
        ticket.away_team ||
        "Away Team";

    const matchDate =
        booking.match_date ||
        ticket.match_date;

    const venue =
        ticket.venue_name ||
        ticket.stadium_or_hall_name ||
        "Venue unavailable";

    const city =
        ticket.city_name ||
        "City unavailable";

    const address =
        ticket.address ||
        ticket.venue_address ||
        "Address unavailable";

    const category =
        booking.category ||
        ticket.category ||
        "Standard";

    const price =
        Number(
            booking.price ??
            ticket.price ??
            0
        );

    const ticketId =
        booking.ticket_id;

    const matchId =
        ticket.match_id ??
        booking.match_id ??
        "—";

    const amenities =
        extractAmenities(ticket);

    const statusInfo =
        getStatusInfo(status, theme);

    return `
        <div
            class="${statusInfo.cardClass}"
            data-status="${status}"
            data-reservation-id="${escapeHTML(
                String(booking.reservation_id)
            )}"
        >

            <!-- Top accent -->
            <div
                class="absolute top-0 left-0
                       w-full h-2.5
                       ${statusInfo.accent}"
            ></div>


            <div class="p-6 sm:p-8 space-y-6">

                <!-- Header -->
                <div
                    class="flex flex-wrap
                           items-center
                           justify-between
                           gap-3"
                >

                    <div
                        class="flex items-center
                               gap-3 flex-wrap"
                    >

                        <span
                            class="${statusInfo.badge}"
                        >
                            ${statusInfo.icon}
                            ${statusInfo.label}
                        </span>

                        <span
                            class="text-xs font-bold
                                   text-stone-500
                                   font-mono
                                   bg-stone-100
                                   px-3 py-1
                                   rounded-full
                                   border border-stone-200"
                        >
                            Ticket ID:
                            #${escapeHTML(
                                String(ticketId)
                            )}
                        </span>

                    </div>

                    <span
                        class="font-mono text-xs
                               text-stone-400
                               font-semibold"
                    >
                        Reservation ID:
                        #${escapeHTML(
                            String(
                                booking.reservation_id
                            )
                        )}
                    </span>

                </div>


                <!-- Match -->
                <div>

                    <div
                        class="text-[11px]
                               font-bold
                               text-stone-400
                               uppercase
                               tracking-wider
                               mb-2"
                    >
                        Match #${escapeHTML(
                            String(matchId)
                        )}
                    </div>

                    <h3
                        class="${statusInfo.titleClass}"
                    >
                        ${escapeHTML(homeTeam)}

                        <span
                            class="${theme.vsText}"
                        >
                            VS
                        </span>

                        ${escapeHTML(awayTeam)}
                    </h3>

                </div>


                <!-- Main details -->
                <div
                    class="${statusInfo.detailBox}
                           grid grid-cols-1
                           md:grid-cols-3
                           gap-4
                           p-5 rounded-2xl
                           border
                           shadow-inner"
                >

                    <!-- Date -->
                    <div class="space-y-1">

                        <span
                            class="text-[11px]
                                   font-bold
                                   text-stone-400
                                   uppercase
                                   tracking-wider
                                   block"
                        >
                            📅 Date & Time
                        </span>

                        <span
                            class="text-xs
                                   font-bold
                                   ${statusInfo.detailText}
                                   block"
                        >
                            ${formatDateTime(matchDate)}
                        </span>

                        <span
                            class="text-[10px]
                                   text-stone-500
                                   block"
                        >
                            Match date
                        </span>

                    </div>


                    <!-- Venue -->
                    <div
                        class="space-y-1
                               md:border-x
                               md:border-stone-200
                               md:px-4"
                    >

                        <span
                            class="text-[11px]
                                   font-bold
                                   text-stone-400
                                   uppercase
                                   tracking-wider
                                   block"
                        >
                            📍 Venue & Location
                        </span>

                        <span
                            class="text-xs
                                   font-bold
                                   ${statusInfo.detailText}
                                   block"
                        >
                            ${escapeHTML(venue)}
                        </span>

                        <span
                            class="text-[10px]
                                   text-stone-500
                                   block"
                        >
                            ${escapeHTML(city)}
                        </span>

                        <span
                            class="text-[10px]
                                   text-stone-400
                                   block"
                        >
                            ${escapeHTML(address)}
                        </span>

                    </div>


                    <!-- Category -->
                    <div
                        class="space-y-1
                               md:pl-2"
                    >

                        <span
                            class="text-[11px]
                                   font-bold
                                   text-stone-400
                                   uppercase
                                   tracking-wider
                                   block"
                        >
                            🎟️ Ticket Category
                        </span>

                        <span
                            class="${statusInfo.categoryBadge}"
                        >
                            ${escapeHTML(category)}
                        </span>

                        <span
                            class="text-[10px]
                                   text-stone-500
                                   block mt-2"
                        >
                            Sport:
                            ${escapeHTML(
                                sportLabel(sport)
                            )}
                        </span>

                    </div>

                </div>


                <!-- Full ticket information -->
                <div class="space-y-2">

                    <span
                        class="text-[11px]
                               font-bold
                               text-stone-400
                               uppercase
                               tracking-wider
                               block"
                    >
                        🎟️ Ticket Information
                    </span>

                    <div
                        class="grid grid-cols-1
                               sm:grid-cols-2
                               lg:grid-cols-4
                               gap-3"
                    >

                        ${infoItem(
                            "Ticket ID",
                            `#${ticketId}`
                        )}

                        ${infoItem(
                            "Reservation ID",
                            `#${booking.reservation_id}`
                        )}

                        ${infoItem(
                            "Sport",
                            sportLabel(sport)
                        )}

                        ${infoItem(
                            "Category",
                            category
                        )}

                        ${infoItem(
                            "Ticket Price",
                            formatMoney(price)
                        )}

                        ${infoItem(
                            "Booking Status",
                            booking.status
                        )}

                        ${infoItem(
                            "Booked At",
                            formatDateTime(
                                booking.reserved_at
                            )
                        )}

                        ${infoItem(
                            "Reservation Expires",
                            formatDateTime(
                                booking.expires_at
                            )
                        )}

                    </div>

                </div>


                <!-- Amenities -->
                <div class="space-y-2">

                    <span
                        class="text-[11px]
                               font-bold
                               text-stone-400
                               uppercase
                               tracking-wider
                               block"
                    >
                        ✨ Included Perks & Amenities
                    </span>

                    <div
                        class="flex flex-wrap gap-2"
                    >
                        ${
                            amenities.length
                                ? amenities
                                    .map(
                                        amenity =>
                                            `<span
                                                class="${theme.amenity}"
                                             >
                                                ${escapeHTML(
                                                    amenity
                                                )}
                                             </span>`
                                    )
                                    .join("")
                                : `
                                    <span
                                        class="px-3 py-1
                                               bg-stone-100
                                               text-stone-600
                                               text-[11px]
                                               font-semibold
                                               rounded-xl
                                               border
                                               border-stone-200"
                                    >
                                        No amenities specified
                                    </span>
                                `
                        }
                    </div>

                </div>

            </div>


            <!-- Footer -->
            <div
                class="${statusInfo.footerClass}
                       px-6 sm:px-8 py-5
                       border-t
                       flex flex-col sm:flex-row
                       items-center
                       justify-between
                       gap-4"
            >

                <div>

                    <span
                        class="text-stone-400
                               text-xs
                               block font-normal"
                    >
                        Total Paid Amount
                    </span>

                    <span
                        class="${statusInfo.priceClass}"
                    >
                        ${formatMoney(price)}
                    </span>

                </div>


                ${createActionArea(
                    booking,
                    status
                )}

            </div>

        </div>
    `;
}


/* ============================================================
   ACTION AREA
============================================================ */

function createActionArea(
    booking,
    status
) {
    if (status === "upcoming") {

        return `
            <div
                class="flex items-center
                       gap-3
                       w-full sm:w-auto"
            >

                <button
                    type="button"
                    class="cancel-booking-btn
                           w-full sm:w-auto
                           px-6 py-3
                           rounded-2xl
                           bg-rose-50
                           hover:bg-rose-500
                           text-rose-600
                           hover:text-white
                           border border-rose-200
                           font-bold text-xs
                           transition-all
                           duration-300
                           shadow-sm
                           flex items-center
                           justify-center gap-2"
                    data-reservation-id="${escapeHTML(
                        String(
                            booking.reservation_id
                        )
                    )}"
                >
                    <span>
                        Request Cancellation
                    </span>
                </button>

            </div>
        `;
    }


    if (status === "pending") {

        return `
            <span
                class="px-5 py-2.5
                       rounded-2xl
                       bg-amber-50
                       text-amber-800
                       border border-amber-200
                       font-bold text-xs
                       shadow-sm"
            >
                ⏳ Reviewing Cancellation
            </span>
        `;
    }


    if (status === "cancelled") {

        const refund =
            booking.refund_amount;

        const penalty =
            booking.penalty_percent;

        return `
            <div
                class="text-right"
            >

                ${
                    refund !== undefined &&
                    refund !== null
                        ? `
                            <span
                                class="text-xs
                                       font-bold
                                       text-emerald-700
                                       bg-emerald-50
                                       px-4 py-2
                                       rounded-xl
                                       border
                                       border-emerald-200"
                            >
                                Refunded:
                                ${formatMoney(refund)}
                            </span>
                        `
                        : `
                            <span
                                class="text-xs
                                       font-bold
                                       text-stone-600
                                       bg-stone-200
                                       px-4 py-2
                                       rounded-xl"
                            >
                                Cancelled
                            </span>
                        `
                }

            </div>
        `;
    }


    if (status === "used") {

        return `
            <span
                class="text-xs
                       font-bold
                       text-sky-800
                       bg-sky-50
                       px-4 py-2
                       rounded-xl
                       border border-sky-200"
            >
                Match Completed
            </span>
        `;
    }


    return "";
}


/* ============================================================
   BOOKING ACTION EVENTS
============================================================ */

function attachBookingActions() {

    document
        .querySelectorAll(
            ".cancel-booking-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const reservationId =
                        Number(
                            button.dataset
                                .reservationId
                        );

                    const booking =
                        enrichedBookings.find(
                            item =>
                                Number(
                                    item.reservation_id
                                ) === reservationId
                        );

                    if (!booking) {
                        return;
                    }

                    await openCancelModal(
                        booking
                    );
                }
            );
        });
}


/* ============================================================
   CANCELLATION MODAL
============================================================ */

function setupCancellationModal() {

    if (confirmCancelButton) {

        confirmCancelButton
            .addEventListener(
                "click",
                submitCancellation
            );
    }

    /*
     * Close modal by clicking outside.
     */
    if (cancelModal) {

        cancelModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    cancelModal
                ) {
                    closeCancelModal();
                }

            }
        );
    }

    /*
     * Existing close button in HTML.
     */
    const closeButton =
        cancelModal?.querySelector(
            "button[onclick='closeCancelModal()']"
        );

    if (closeButton) {

        closeButton.removeAttribute(
            "onclick"
        );

        closeButton.addEventListener(
            "click",
            closeCancelModal
        );
    }

    /*
     * Existing Keep Ticket button.
     */
    const keepButton =
        cancelModal?.querySelector(
            "button[onclick='closeCancelModal()']"
        );

    if (keepButton) {

        keepButton.removeAttribute(
            "onclick"
        );

        keepButton.addEventListener(
            "click",
            closeCancelModal
        );
    }
}


async function openCancelModal(booking) {

    currentCancellationBooking =
        booking;

    const ticket =
        booking.ticket || {};

    const title =
        `${ticket.home_team || "Home Team"} vs ${
            ticket.away_team || "Away Team"
        }`;

    setText(
        "modal-match-title",
        title
    );

    setText(
        "modal-orig-price",
        formatMoney(
            Number(
                booking.price ??
                ticket.price ??
                0
            )
        )
    );

    setText(
        "modal-penalty-price",
        "Calculating..."
    );

    setText(
        "modal-refund-price",
        "Calculating..."
    );

    setConfirmButtonState(
        true,
        "Calculating..."
    );

    showModal();

    try {

        /*
         * REAL backend calculation.
         */
        const penalty =
            await getCancellationPenalty(
                Number(
                    booking.reservation_id
                )
            );

        const percentage =
            Number(
                penalty.penalty_percent || 0
            );

        const refund =
            Number(
                penalty.refund_amount || 0
            );

        const originalPrice =
            Number(
                booking.price ??
                ticket.price ??
                0
            );

        const penaltyAmount =
            Math.max(
                0,
                originalPrice - refund
            );

        setText(
            "modal-penalty-price",
            `-${formatMoney(penaltyAmount)} (${percentage.toFixed(2)}%)`
        );

        setText(
            "modal-refund-price",
            formatMoney(refund)
        );

        /*
         * Save backend calculation so the
         * confirmation uses the same result.
         */
        currentCancellationBooking = {
            ...booking,
            cancellationPenalty: {
                penalty_percent:
                    percentage,
                refund_amount:
                    refund,
                penalty_amount:
                    penaltyAmount
            }
        };

        setConfirmButtonState(
            false,
            "Submit Request"
        );

    } catch (error) {

        console.error(
            "Failed to calculate cancellation:",
            error
        );

        setText(
            "modal-penalty-price",
            "Unavailable"
        );

        setText(
            "modal-refund-price",
            "Unavailable"
        );

        setConfirmButtonState(
            true,
            "Cannot Cancel"
        );

        alert(
            error.message ||
            "Cancellation information could not be calculated."
        );
    }
}


/* ============================================================
   SUBMIT CANCELLATION
============================================================ */

async function submitCancellation() {

    if (
        !currentCancellationBooking ||
        !currentCancellationBooking
            .cancellationPenalty
    ) {
        return;
    }

    const reservationId =
        Number(
            currentCancellationBooking
                .reservation_id
        );

    setConfirmButtonState(
        true,
        "Submitting..."
    );

    try {

        /*
         * REAL cancellation request.
         */
        const response =
            await cancelMyReservation(
                reservationId
            );

        /*
         * Keep the backend response in the
         * current page state.
         */
        const bookingIndex =
            enrichedBookings.findIndex(
                item =>
                    Number(
                        item.reservation_id
                    ) === reservationId
            );

        if (bookingIndex !== -1) {

            enrichedBookings[
                bookingIndex
            ] = {
                ...enrichedBookings[
                    bookingIndex
                ],

                cancellation_status:
                    response.status,

                cancel_id:
                    response.cancel_id,

                penalty_percent:
                    response.penalty_percent,

                refund_amount:
                    response.refund_amount
            };
        }

        closeCancelModal();

        renderBookings();

        alert(
            "Your cancellation request has been submitted and is waiting for admin approval."
        );

    } catch (error) {

        console.error(
            "Cancellation request failed:",
            error
        );

        setConfirmButtonState(
            false,
            "Submit Request"
        );

        alert(
            error.message ||
            "Cancellation request could not be submitted."
        );
    }
}


/* ============================================================
   MODAL HELPERS
============================================================ */

function showModal() {

    if (!cancelModal) {
        return;
    }

    cancelModal.classList.remove(
        "hidden"
    );
}


function closeCancelModal() {

    if (!cancelModal) {
        return;
    }

    cancelModal.classList.add(
        "hidden"
    );

    currentCancellationBooking =
        null;

    setConfirmButtonState(
        false,
        "Submit Request"
    );
}


function setConfirmButtonState(
    disabled,
    text
) {

    if (!confirmCancelButton) {
        return;
    }

    confirmCancelButton.disabled =
        disabled;

    confirmCancelButton.textContent =
        text;

    if (disabled) {

        confirmCancelButton.classList.add(
            "opacity-60",
            "cursor-not-allowed"
        );

    } else {

        confirmCancelButton.classList.remove(
            "opacity-60",
            "cursor-not-allowed"
        );
    }
}


/* ============================================================
   FILTER TABS
============================================================ */

function setupFilterTabs() {

    const tabs =
        document.querySelectorAll(
            ".filter-tab"
        );

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                currentFilter =
                    tab.dataset.filter ||
                    "all";

                tabs.forEach(item => {

                    item.className =
                        "filter-tab px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition whitespace-nowrap";
                });

                tab.className =
                    "filter-tab px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white transition shadow-sm whitespace-nowrap";

                renderBookings();
            }
        );
    });
}


/* ============================================================
   STATUS STYLES
============================================================ */

function getStatusInfo(
    status,
    theme
) {

    if (status === "cancelled") {

        return {
            label:
                "Cancelled & Refunded",
            icon: "❌",
            accent:
                "bg-stone-300",
            badge:
                "px-3.5 py-1 rounded-full text-[11px] font-black bg-stone-200 text-stone-700 uppercase tracking-wider border border-stone-300 shadow-sm",
            cardClass:
                "booking-card bg-stone-100/70 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden relative opacity-75",
            titleClass:
                "font-oswald text-3xl sm:text-4xl font-bold text-stone-500 uppercase tracking-wide line-through",
            detailBox:
                "bg-stone-200/50 border-stone-200",
            detailText:
                "text-stone-600",
            categoryBadge:
                "text-xs font-bold text-stone-600 bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-300 inline-block",
            footerClass:
                "bg-stone-200/40 border-stone-200",
            priceClass:
                "font-oswald text-2xl font-bold text-stone-400 line-through"
        };
    }


    if (status === "pending") {

        return {
            label:
                "Pending Admin Approval",
            icon: "⏳",
            accent:
                "bg-gradient-to-r from-amber-100 via-amber-400 to-amber-100",
            badge:
                "px-3.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 uppercase tracking-wider border border-amber-300 shadow-sm",
            cardClass:
                "booking-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white shadow-xl transition-all duration-500 overflow-hidden relative opacity-95",
            titleClass:
                "font-oswald text-3xl sm:text-4xl font-bold text-stone-900 uppercase tracking-wide",
            detailBox:
                "bg-[#FBF9F5] border-stone-200/80",
            detailText:
                "text-stone-800",
            categoryBadge:
                "text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block",
            footerClass:
                "bg-white/50 border-stone-200/60",
            priceClass:
                "font-oswald text-2xl font-bold text-stone-900"
        };
    }


    if (status === "used") {

        return {
            label:
                "Match Completed",
            icon: "✓",
            accent:
                "bg-sky-300",
            badge:
                "px-3.5 py-1 rounded-full text-[11px] font-black bg-sky-100 text-sky-800 uppercase tracking-wider border border-sky-200 shadow-sm",
            cardClass:
                "booking-card bg-stone-100/70 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden relative opacity-75",
            titleClass:
                "font-oswald text-3xl sm:text-4xl font-bold text-stone-700 uppercase tracking-wide",
            detailBox:
                "bg-stone-200/50 border-stone-200",
            detailText:
                "text-stone-600",
            categoryBadge:
                "text-xs font-bold text-stone-600 bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-300 inline-block",
            footerClass:
                "bg-stone-200/40 border-stone-200",
            priceClass:
                "font-oswald text-2xl font-bold text-stone-500"
        };
    }


    /*
     * Upcoming
     */
    return {
        label:
            `${sportLabel(
                normalizeSport(
                    theme.sport
                )
            )} • Upcoming Match`,
        icon:
            theme.icon,
        accent:
            theme.accent,
        badge:
            `px-3.5 py-1 rounded-full text-[11px] font-black ${theme.badge} ${theme.badgeText} uppercase tracking-wider border ${theme.badgeBorder} shadow-sm`,
        cardClass:
            "booking-card bg-white/85 backdrop-blur-xl rounded-3xl border border-white shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group",
        titleClass:
            "font-oswald text-3xl sm:text-4xl font-bold text-stone-900 uppercase tracking-wide",
        detailBox:
            "bg-[#FBF9F5] border-stone-200/80",
        detailText:
            "text-stone-800",
        categoryBadge:
            `text-xs font-bold ${theme.categoryText} ${theme.categoryBg} px-2.5 py-1 rounded-lg border ${theme.categoryBorder} inline-block`,
        footerClass:
            "bg-white/50 border-stone-200/60",
        priceClass:
            "font-oswald text-2xl font-bold text-stone-900"
    };
}


/* ============================================================
   SPORT THEMES
============================================================ */

function getSportTheme(sport) {

    if (sport === "football") {

        return {
            sport: "football",
            icon: "⚽",
            accent:
                "bg-gradient-to-r from-[#D6F5E3] via-[#82D6A5] to-[#D6F5E3]",
            badge:
                "bg-[#D6F5E3]",
            badgeText:
                "text-emerald-900",
            badgeBorder:
                "border-[#82D6A5]/60",
            vsText:
                "text-[#82D6A5] italic font-light mx-2",
            categoryText:
                "text-emerald-700",
            categoryBg:
                "bg-emerald-50",
            categoryBorder:
                "border-emerald-200/60",
            amenity:
                "px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-xl border border-emerald-200/60"
        };
    }


    if (sport === "volleyball") {

        return {
            sport: "volleyball",
            icon: "🏐",
            accent:
                "bg-gradient-to-r from-[#D9EAFB] via-[#80B6E9] to-[#D9EAFB]",
            badge:
                "bg-[#D9EAFB]",
            badgeText:
                "text-sky-900",
            badgeBorder:
                "border-[#80B6E9]/60",
            vsText:
                "text-[#80B6E9] italic font-light mx-2",
            categoryText:
                "text-sky-700",
            categoryBg:
                "bg-sky-50",
            categoryBorder:
                "border-sky-200/60",
            amenity:
                "px-3 py-1 bg-sky-50 text-sky-800 text-[11px] font-semibold rounded-xl border border-sky-200/60"
        };
    }


    return {
        sport: "basketball",
        icon: "🏀",
        accent:
            "bg-gradient-to-r from-[#FDE2D3] via-[#F69664] to-[#FDE2D3]",
        badge:
            "bg-[#FDE2D3]",
        badgeText:
            "text-orange-900",
        badgeBorder:
            "border-[#F69664]/60",
        vsText:
            "text-[#F69664] italic font-light mx-2",
        categoryText:
            "text-orange-700",
        categoryBg:
            "bg-orange-50",
        categoryBorder:
            "border-orange-200/60",
        amenity:
            "px-3 py-1 bg-orange-50 text-orange-800 text-[11px] font-semibold rounded-xl border border-orange-200/60"
    };
}


/* ============================================================
   AMENITIES
============================================================ */

function extractAmenities(ticket) {

    const possible =
        ticket.amenities ||
        ticket.perks ||
        ticket.features;

    if (!possible) {
        return [];
    }

    if (Array.isArray(possible)) {
        return possible.map(
            item =>
                typeof item === "string"
                    ? item
                    : item?.name ||
                      item?.title ||
                      JSON.stringify(item)
        );
    }

    if (typeof possible === "string") {

        return possible
            .split(
                /[,|•\n]+/
            )
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}


/* ============================================================
   INFO ITEM
============================================================ */

function infoItem(label, value) {

    return `
        <div
            class="bg-[#FBF9F5]
                   border border-stone-200/70
                   rounded-xl px-3 py-2"
        >

            <span
                class="text-[9px]
                       font-bold
                       text-stone-400
                       uppercase
                       tracking-wider
                       block"
            >
                ${escapeHTML(label)}
            </span>

            <span
                class="text-[11px]
                       font-bold
                       text-stone-700
                       block mt-0.5
                       break-words"
            >
                ${escapeHTML(
                    String(
                        value ??
                        "—"
                    )
                )}
            </span>

        </div>
    `;
}


/* ============================================================
   EMPTY / LOADING / ERROR
============================================================ */

function showLoading() {

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div
            class="bg-white/85
                   rounded-3xl
                   border border-white
                   shadow-xl
                   p-12 text-center"
        >
            <div
                class="inline-block
                       w-8 h-8
                       border-4
                       border-stone-200
                       border-t-[#80B6E9]
                       rounded-full
                       animate-spin mb-4"
            ></div>

            <p
                class="text-sm
                       font-bold
                       text-stone-600"
            >
                Loading your bookings...
            </p>
        </div>
    `;
}


function showEmptyState() {

    if (!container) {
        return;
    }

    const message =
        currentFilter === "all"
            ? "You don't have any bookings yet."
            : `You don't have any ${currentFilter} tickets.`;

    container.innerHTML = `
        <div
            class="bg-white/85
                   rounded-3xl
                   border border-white
                   shadow-xl
                   p-12 text-center"
        >

            <div
                class="text-4xl mb-4"
            >
                🎟️
            </div>

            <p
                class="font-oswald
                       text-2xl
                       font-bold
                       text-stone-800
                       uppercase"
            >
                No Tickets Found
            </p>

            <p
                class="text-xs
                       text-stone-500
                       mt-2"
            >
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


function showError(message) {

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div
            class="bg-white
                   rounded-3xl
                   border border-rose-200
                   shadow-xl
                   p-10 text-center"
        >

            <div
                class="text-4xl mb-4"
            >
                ⚠️
            </div>

            <p
                class="font-oswald
                       text-2xl
                       font-bold
                       text-stone-800
                       uppercase"
            >
                Could Not Load Bookings
            </p>

            <p
                class="text-xs
                       text-stone-500
                       mt-2"
            >
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


/* ============================================================
   DATE / MONEY
============================================================ */

function getMatchDate(booking) {

    const value =
        booking.match_date ||
        booking.ticket?.match_date;

    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}


function formatDateTime(value) {

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
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatMoney(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return "$0.00";
    }

    return `$${number.toFixed(2)}`;
}


/* ============================================================
   SPORT HELPERS
============================================================ */

function normalizeSport(value) {

    const sport =
        String(
            value || ""
        ).trim().toLowerCase();

    if (
        sport.includes("football") ||
        sport.includes("soccer")
    ) {
        return "football";
    }

    if (
        sport.includes("volleyball")
    ) {
        return "volleyball";
    }

    if (
        sport.includes("basketball")
    ) {
        return "basketball";
    }

    return "basketball";
}


function sportLabel(sport) {

    switch (sport) {

        case "football":
            return "Football";

        case "volleyball":
            return "Volleyball";

        case "basketball":
            return "Basketball";

        default:
            return "Sport";
    }
}


/* ============================================================
   TEXT HELPERS
============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "—";
    }
}


function escapeHTML(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}