import {
    getCities,
    getVenues,
    searchTickets
} from "../services/api.js";


// ============================================================
// Search Page State
// ============================================================

const state = {
    cities: [],
    venues: [],
    teams: [],

    selectedCityId: "",
    selectedVenueId: "",
    selectedTeamId: "",

    selectedDateFrom: "",
    selectedDateTo: "",

    currentMonth: new Date()
};


// ============================================================
// DOM Helpers
// ============================================================

const $ = (id) => document.getElementById(id);

const searchForm = $("elasticsearch-filter-form");

const cityButton = $("city-dropdown-button");
const cityMenu = $("city-dropdown-menu");
const cityLabel = $("city-dropdown-label");
const cityOptions = $("city-dropdown-options");

const venueButton = $("venue-dropdown-button");
const venueMenu = $("venue-dropdown-menu");
const venueLabel = $("venue-dropdown-label");
const venueOptions = $("venue-dropdown-options");

const teamButton = $("team-dropdown-button");
const teamMenu = $("team-dropdown-menu");
const teamLabel = $("team-dropdown-label");
const teamOptions = $("team-dropdown-options");

const dateFromButton = $("date-from-button");
const dateFromLabel = $("date-from-label");
const dateFromPicker = $("date-from-picker");

const dateToButton = $("date-to-button");
const dateToLabel = $("date-to-label");
const dateToPicker = $("date-to-picker");


// ============================================================
// Initial Page Setup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initSearchPage();
});


async function initSearchPage() {
    console.log("Search page initialized");

    setupDropdowns();
    setupDatePickers();
    setupSearchForm();

    loadFiltersFromUrl();

    await loadCities();
    await loadVenues("");

    loadTeams();

    await executeSearch();
}

// ============================================================
// Custom Dropdowns
// ============================================================

function setupDropdown(button, menu, arrow) {
    if (!button || !menu) return;

    button.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpen = !menu.classList.contains("hidden");

        closeAllDropdowns();

        if (!isOpen) {
            menu.classList.remove("hidden");
            arrow?.classList.add("rotate-180");
        }
    });
}


function closeAllDropdowns() {
    const dropdowns = [
        [cityMenu, $("city-dropdown-arrow")],
        [venueMenu, $("venue-dropdown-arrow")],
        [teamMenu, $("team-dropdown-arrow")]
    ];

    dropdowns.forEach(([menu, arrow]) => {
        if (menu) {
            menu.classList.add("hidden");
        }

        if (arrow) {
            arrow.classList.remove("rotate-180");
        }
    });
}


function createDropdownOption({
                                  container,
                                  label,
                                  value,
                                  selected = false,
                                  onSelect
                              }) {
    const option = document.createElement("button");

    option.type = "button";

    option.className = `
        w-full text-left px-3.5 py-2.5 rounded-xl
        text-sm font-medium
        transition-all duration-150
        ${selected
        ? "bg-[#F3E7D3] text-stone-900"
        : "text-stone-700 hover:bg-[#F8EDE0] hover:text-stone-900"
    }
    `;

    option.textContent = label;

    option.addEventListener("click", (event) => {
        event.stopPropagation();
        onSelect(value, label);
    });

    container.appendChild(option);
}


function selectCity(cityId, cityName) {
    state.selectedCityId = cityId;

    $("filter-city").value = cityId;
    cityLabel.textContent = cityName;

    closeAllDropdowns();

    // Venue options will be refreshed when we load venues.
    state.selectedVenueId = "";
    $("filter-venue").value = "";
    venueLabel.textContent = "All Venues";
}


function selectVenue(venueId, venueName) {
    state.selectedVenueId = venueId;

    $("filter-venue").value = venueId;
    venueLabel.textContent = venueName;

    closeAllDropdowns();
}


function selectTeam(teamId, teamName) {
    state.selectedTeamId = teamId;

    $("filter-team").value = teamId;
    teamLabel.textContent = teamName;

    closeAllDropdowns();
}


// ============================================================
// Dropdown Event Setup
// ============================================================

function setupDropdowns() {
    setupDropdown(
        cityButton,
        cityMenu,
        $("city-dropdown-arrow")
    );

    setupDropdown(
        venueButton,
        venueMenu,
        $("venue-dropdown-arrow")
    );

    setupDropdown(
        teamButton,
        teamMenu,
        $("team-dropdown-arrow")
    );

    document.addEventListener("click", () => {
        closeAllDropdowns();
    });
}
// ============================================================
// Cities
// ============================================================

async function loadCities() {
    try {
        cityOptions.innerHTML = "";

        createDropdownOption({
            container: cityOptions,
            label: "All Cities",
            value: "",
            selected: true,
            onSelect: (value, label) => {
                selectCity(value, label);
                loadVenues("");
            }
        });

        const cities = await getCities();

        state.cities = cities || [];

        state.cities.forEach((city) => {
            createDropdownOption({
                container: cityOptions,
                label: city.name,
                value: city.city_id,
                onSelect: (value, label) => {
                    selectCity(value, label);
                    loadVenues(value);
                }
            });
        });

    } catch (error) {
        console.error("Failed to load cities:", error);

        cityOptions.innerHTML = `
            <div class="px-3.5 py-3 text-sm text-red-500">
                Failed to load cities.
            </div>
        `;
    }
}


// ============================================================
// Venues
// ============================================================

async function loadVenues(cityId = "") {
    try {
        venueOptions.innerHTML = "";

        createDropdownOption({
            container: venueOptions,
            label: "All Venues",
            value: "",
            selected: true,
            onSelect: (value, label) => {
                selectVenue(value, label);
            }
        });

        const venues = await getVenues(cityId);

        state.venues = venues || [];

        state.venues.forEach((venue) => {
            createDropdownOption({
                container: venueOptions,
                label: venue.name,
                value: venue.venue_id,
                onSelect: (value, label) => {
                    selectVenue(value, label);
                }
            });
        });

    } catch (error) {
        console.error("Failed to load venues:", error);

        venueOptions.innerHTML = `
            <div class="px-3.5 py-3 text-sm text-red-500">
                Failed to load venues.
            </div>
        `;
    }
}
// ============================================================
// Teams
// ============================================================

function loadTeams() {
    teamOptions.innerHTML = "";

    createDropdownOption({
        container: teamOptions,
        label: "All Teams",
        value: "",
        selected: true,
        onSelect: (value, label) => {
            selectTeam(value, label);
        }
    });

    const message = document.createElement("div");

    message.className = `
        px-3.5 py-3
        text-sm
        text-stone-400
    `;

    message.textContent =
        "Team filtering will be available soon.";

    teamOptions.appendChild(message);
}
// ============================================================
// Custom Calendar
// ============================================================

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


function formatDateForDisplay(dateString) {
    if (!dateString) return "Choose date";

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


function formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function renderCalendar(picker, type) {
    picker.innerHTML = "";

    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = document.createElement("div");

    calendar.className = `
        w-72
        bg-[#FFFCF8]
        border border-stone-200
        rounded-2xl
        shadow-xl
        p-4
    `;

    // --------------------------------------------------------
    // Header
    // --------------------------------------------------------

    const header = document.createElement("div");

    header.className = `
        flex items-center justify-between
        mb-4
    `;

    const monthTitle = document.createElement("div");

    monthTitle.className = `
        text-sm font-bold text-stone-800
    `;

    monthTitle.textContent =
        `${monthNames[month]} ${year}`;

    const navigation = document.createElement("div");

    navigation.className = "flex items-center gap-1";

    const previousButton = createCalendarNavButton("←");
    const nextButton = createCalendarNavButton("→");

    previousButton.addEventListener("click", (event) => {
        event.stopPropagation();

        state.currentMonth = new Date(
            year,
            month - 1,
            1
        );

        renderCalendar(picker, type);
    });

    nextButton.addEventListener("click", (event) => {
        event.stopPropagation();

        state.currentMonth = new Date(
            year,
            month + 1,
            1
        );

        renderCalendar(picker, type);
    });

    navigation.appendChild(previousButton);
    navigation.appendChild(nextButton);

    header.appendChild(monthTitle);
    header.appendChild(navigation);

    calendar.appendChild(header);

    // --------------------------------------------------------
    // Weekdays
    // --------------------------------------------------------

    const weekdays = document.createElement("div");

    weekdays.className =
        "grid grid-cols-7 gap-1 mb-2";

    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
        .forEach((day) => {
            const weekday = document.createElement("div");

            weekday.className = `
                text-center
                text-[10px]
                font-bold
                text-stone-400
                py-1
            `;

            weekday.textContent = day;

            weekdays.appendChild(weekday);
        });

    calendar.appendChild(weekdays);

    // --------------------------------------------------------
    // Days
    // --------------------------------------------------------

    const daysGrid = document.createElement("div");

    daysGrid.className =
        "grid grid-cols-7 gap-1";

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        daysGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDateForApi(date);

        const dayButton = document.createElement("button");

        dayButton.type = "button";
        dayButton.textContent = day;

        const isSelected =
            type === "from"
                ? state.selectedDateFrom === dateString
                : state.selectedDateTo === dateString;

        const today = new Date();

        const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        dayButton.className = `
            h-9 w-9
            rounded-xl
            text-sm
            font-medium
            transition-all duration-150
            ${
            isSelected
                ? "bg-[#80B6E9] text-white shadow-sm"
                : isToday
                    ? "bg-[#F8EDE0] text-stone-900 font-bold"
                    : "text-stone-700 hover:bg-[#F8EDE0] hover:text-stone-900"
        }
        `;

        dayButton.addEventListener("click", (event) => {
            event.stopPropagation();

            selectDate(dateString, type);
        });

        daysGrid.appendChild(dayButton);
    }

    calendar.appendChild(daysGrid);

    picker.appendChild(calendar);
}


function createCalendarNavButton(symbol) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = symbol;

    button.className = `
        w-8 h-8
        rounded-lg
        flex items-center justify-center
        text-stone-500
        hover:bg-[#F8EDE0]
        hover:text-stone-900
        transition-colors
    `;

    return button;
}


function selectDate(dateString, type) {
    if (type === "from") {
        state.selectedDateFrom = dateString;

        $("filter-date-from").value = dateString;
        dateFromLabel.textContent =
            formatDateForDisplay(dateString);

        dateFromPicker.classList.add("hidden");
    } else {
        state.selectedDateTo = dateString;

        $("filter-date-to").value = dateString;
        dateToLabel.textContent =
            formatDateForDisplay(dateString);

        dateToPicker.classList.add("hidden");
    }
}


function openDatePicker(type) {
    const picker =
        type === "from"
            ? dateFromPicker
            : dateToPicker;

    const otherPicker =
        type === "from"
            ? dateToPicker
            : dateFromPicker;

    otherPicker.classList.add("hidden");

    picker.classList.toggle("hidden");

    if (!picker.classList.contains("hidden")) {
        renderCalendar(picker, type);
    }
}


function setupDatePickers() {
    dateFromButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openDatePicker("from");
    });

    dateToButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openDatePicker("to");
    });

    dateFromPicker.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    dateToPicker.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        dateFromPicker.classList.add("hidden");
        dateToPicker.classList.add("hidden");
    });
}
// ============================================================
// Search Filters
// ============================================================

function getSelectedSport() {
    const selected = document.querySelector(
        'input[name="sport_type"]:checked'
    );

    return selected ? selected.value : "";
}


function getSelectedCategory() {
    const selected = document.querySelector(
        'input[name="category"]:checked'
    );

    return selected ? selected.value : "";
}


function buildSearchFilters() {
    const filters = {};

    const sportType = getSelectedSport();
    const category = getSelectedCategory();

    const cityId = $("filter-city").value;
    const venueId = $("filter-venue").value;
    const teamId = $("filter-team").value;

    const dateFrom = $("filter-date-from").value;
    const dateTo = $("filter-date-to").value;

    const minPrice = $("filter-min-price").value;
    const maxPrice = $("filter-max-price").value;

    if (sportType) {
        filters.sport_type = sportType;
    }

    if (category) {
        filters.category = category;
    }

    if (cityId) {
        filters.city_id = Number(cityId);
    }

    if (venueId) {
        filters.venue_id = Number(venueId);
    }

    if (teamId) {
        filters.team_id = Number(teamId);
    }

    if (dateFrom) {
        filters.date_from = dateFrom;
    }

    if (dateTo) {
        filters.date_to = dateTo;
    }

    if (minPrice) {
        filters.min_price = Number(minPrice);
    }

    if (maxPrice) {
        filters.max_price = Number(maxPrice);
    }

    return filters;
}


// ============================================================
// URL Parameters
// ============================================================

function loadFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);

    const sport = params.get("sport");

    if (sport) {
        const normalizedSport =
            sport.charAt(0).toUpperCase() +
            sport.slice(1).toLowerCase();

        const sportInput = document.querySelector(
            `input[name="sport_type"][value="${normalizedSport}"]`
        );

        if (sportInput) {
            sportInput.checked = true;
        }
    }
}

// ============================================================
// Search Submission
// ============================================================

async function handleSearchSubmit(event) {
    event.preventDefault();

    await executeSearch();
}


function setupSearchForm() {
    if (!searchForm) return;

    searchForm.addEventListener(
        "submit",
        handleSearchSubmit
    );
}

// ============================================================
// Search Results
// ============================================================

function getResultsContainer() {
    return document.getElementById("search-results-container");
}


function renderSearchResults(results) {
    const container = getResultsContainer();

    if (!container) {
        console.error("Search results container not found.");
        return;
    }

    container.innerHTML = "";

    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
                <div class="text-3xl mb-3">⌕</div>
                <h3 class="text-lg font-bold text-stone-800 mb-1">
                    No tickets found
                </h3>
                <p class="text-sm text-stone-500">
                    Try changing your filters and search again.
                </p>
            </div>
        `;

        return;
    }

    results.forEach((ticket) => {
        container.appendChild(createTicketCard(ticket));
    });
}


function createTicketCard(ticket) {
    const card = document.createElement("article");

    card.className = `
        bg-white
        border border-stone-200
        rounded-2xl
        p-5
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all duration-200
    `;

    const date = ticket.match_date
        ? new Date(ticket.match_date).toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        )
        : "Date unavailable";

    const price = ticket.price != null
        ? `$${Number(ticket.price).toLocaleString()}`
        : "Price unavailable";

    const category = ticket.category || "Ticket";

    const capacity = ticket.remaining_capacity != null
        ? `${ticket.remaining_capacity} left`
        : "Availability unavailable";

    const homeTeam = ticket.home_team || "Home Team";
    const awayTeam = ticket.away_team || "Away Team";

    const venue = ticket.venue_name || "Venue unavailable";
    const city = ticket.city_name || "";

    card.innerHTML = `
        <div class="flex items-start justify-between gap-4">

            <div class="min-w-0">

                <div class="flex items-center gap-2 mb-2">
                    <span class="px-2.5 py-1 rounded-full bg-[#F8EDE0] text-stone-700 text-[10px] font-bold uppercase tracking-wider">
                        ${escapeHtml(category)}
                    </span>

                    <span class="text-xs text-stone-400">
                        ${escapeHtml(capacity)}
                    </span>
                </div>

                <h3 class="text-lg font-bold text-stone-900 truncate">
                    ${escapeHtml(homeTeam)}
                    <span class="text-stone-400 font-medium mx-1">vs</span>
                    ${escapeHtml(awayTeam)}
                </h3>

                <div class="mt-3 space-y-1.5 text-sm text-stone-500">

                    <div class="flex items-center gap-2">
                        <span class="text-stone-400">📅</span>
                        <span>${escapeHtml(date)}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-stone-400">📍</span>
                        <span>
                            ${escapeHtml(venue)}
                            ${city ? `, ${escapeHtml(city)}` : ""}
                        </span>
                    </div>

                </div>

            </div>

            <div class="flex flex-col items-end justify-between gap-4 shrink-0">

                <div class="text-right">
                    <div class="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                        From
                    </div>

                    <div class="text-xl font-bold text-stone-900">
                        ${escapeHtml(price)}
                    </div>
                </div>

                <button
                    type="button"
                    class="ticket-details-button inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#82D6A5] via-[#80B6E9] to-[#F69664] text-slate-950 text-xs font-bold shadow-sm hover:scale-105 transition-transform duration-200"
                    data-ticket-id="${escapeHtml(ticket.ticket_id)}"
                >
                    View Details
                    <span>→</span>
                </button>

            </div>

        </div>
    `;

    const detailsButton =
        card.querySelector(".ticket-details-button");

    detailsButton.addEventListener("click", () => {
        openTicketDetails(ticket.ticket_id);
    });

    return card;
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================
// Ticket Details
// ============================================================

function openTicketDetails(ticketId) {
    if (!ticketId) {
        console.error("Missing ticket ID.");
        return;
    }

    window.location.href =
        `ticket.html?id=${encodeURIComponent(ticketId)}`;
}
// ============================================================
// Loading & Error States
// ============================================================

function showLoadingState() {
    const container = getResultsContainer();

    if (!container) return;

    container.innerHTML = `
        <div class="col-span-full text-center py-20 bg-white/60 rounded-3xl border border-dashed border-stone-300 text-stone-400 font-medium">
            Searching matches...
        </div>
    `;
}


function showErrorState(message = "Something went wrong while searching.") {
    const container = getResultsContainer();

    if (!container) return;

    container.innerHTML = `
        <div class="col-span-full text-center py-20 bg-white/60 rounded-3xl border border-dashed border-red-200">
            <h3 class="text-lg font-bold text-stone-800 mb-2">
                Search failed
            </h3>

            <p class="text-sm text-stone-500">
                ${escapeHtml(message)}
            </p>
        </div>
    `;
}


// ============================================================
// Execute Search
// ============================================================

async function executeSearch() {
    const filters = buildSearchFilters();

    showLoadingState();

    try {
        const results = await searchTickets(filters);

        renderSearchResults(results);

    } catch (error) {
        console.error("Search failed:", error);

        showErrorState(
            error?.message || "Unable to load tickets."
        );
    }
}