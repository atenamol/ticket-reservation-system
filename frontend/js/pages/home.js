import { searchTickets } from "../services/api.js";
import {
    getUserData,
    clearAuthData
} from "../utils/storage.js";

document.addEventListener("DOMContentLoaded", async () => {

    const authBtn = document.getElementById("auth-btn");

    const adminContainer = document.getElementById(
        "admin-panel-btn-container"
    );

    const userMenuContainer = document.getElementById(
        "user-menu-btn-container"
    );

    const hamburgerBtn = document.getElementById("hamburger-btn");

    const sidebar = document.getElementById("sidebar-menu");

    const sidebarBackdrop = document.getElementById(
        "sidebar-backdrop"
    );

    const closeSidebarBtn = document.getElementById(
        "close-sidebar-btn"
    );

    const logoutBtn = document.getElementById("logout-btn");

    const upcomingContainer = document.getElementById(
        "upcoming-matches-container"
    );

    initializeAuthUI();
    initializeSidebar();
    initializeLogout();

    await loadUpcomingMatches();

    function initializeAuthUI() {

        const user = getUserData();

        if (!user) {
            adminContainer?.classList.add("hidden");
            userMenuContainer?.classList.add("hidden");

            if (authBtn) {
                authBtn.classList.remove("hidden");
                authBtn.href = "login.html";
                authBtn.innerHTML = "<span>Login / Signup</span>";
            }

            return;
        }

        if (authBtn) {
            authBtn.classList.add("hidden");
        }

        const role =
            user.role ||
            user.user_role ||
            user.type ||
            "";

        if (
            String(role).toLowerCase() === "admin"
        ) {
            adminContainer?.classList.remove("hidden");
            userMenuContainer?.classList.add("hidden");
        } else {
            adminContainer?.classList.add("hidden");
            userMenuContainer?.classList.remove("hidden");
        }
    }

    function initializeSidebar() {
        if (!hamburgerBtn) return;

        const openSidebar = () => {
            sidebar?.classList.remove("-translate-x-full");
            sidebarBackdrop?.classList.remove("hidden");
            requestAnimationFrame(() => {
                sidebarBackdrop?.classList.add("opacity-100");
            });
        };

        const closeSidebar = () => {
            sidebar?.classList.add("-translate-x-full");
            sidebarBackdrop?.classList.remove("opacity-100");
            setTimeout(() => {
                sidebarBackdrop?.classList.add("hidden");
            }, 300);
        };

        hamburgerBtn.addEventListener("click", openSidebar);
        closeSidebarBtn?.addEventListener("click", closeSidebar);
        sidebarBackdrop?.addEventListener("click", closeSidebar);
    }

    function initializeLogout() {

        logoutBtn?.addEventListener(
            "click",
            () => {

                clearAuthData();

                window.location.href = "index.html";
            }
        );
    }

    async function loadUpcomingMatches() {

        if (!upcomingContainer) return;

        try {

            upcomingContainer.innerHTML = createLoadingCards();

            const tickets = await searchTickets();

            const now = new Date();

            const futureTickets = tickets.filter(ticket => {

                const matchDate =
                    new Date(ticket.match_date);

                return (
                    !isNaN(matchDate) &&
                    matchDate > now
                );
            });

            const matchesMap = new Map();

            futureTickets.forEach(ticket => {

                const existing =
                    matchesMap.get(ticket.match_id);

                if (!existing) {

                    matchesMap.set(
                        ticket.match_id,
                        {
                            ...ticket,
                            cheapestTicket: ticket
                        }
                    );

                    return;
                }

                if (
                    Number(ticket.price) <
                    Number(
                        existing.cheapestTicket.price
                    )
                ) {
                    existing.cheapestTicket = ticket;
                }
            });

            const matches = Array.from(
                matchesMap.values()
            )
                .sort(
                    (a, b) =>
                        new Date(a.match_date) -
                        new Date(b.match_date)
                )
                .slice(0, 3);

            if (!matches.length) {

                upcomingContainer.innerHTML = `
                    <div class="col-span-full bg-white rounded-3xl border border-stone-200 shadow-lg p-10 text-center">
                        <h3 class="font-oswald text-2xl text-stone-800 mb-2">
                            No Upcoming Matches
                        </h3>
                        <p class="font-chakra text-stone-500">
                            There are currently no upcoming matches available.
                        </p>
                    </div>
                `;

                return;
            }

            upcomingContainer.innerHTML =
                matches
                    .map(createMatchCard)
                    .join("");

        } catch (error) {

            console.error(error);

            upcomingContainer.innerHTML = `
                <div class="col-span-full bg-white rounded-3xl border border-red-200 shadow-lg p-10 text-center">
                    <h3 class="font-oswald text-2xl text-red-600 mb-2">
                        Failed To Load Matches
                    </h3>
                    <p class="font-chakra text-stone-500">
                        Please try again later.
                    </p>
                </div>
            `;
        }
    }

    function createMatchCard(match) {

        const sport =
            String(
                match.sport_type || ""
            ).toLowerCase();

        const styles =
            getSportStyles(sport);

        const date =
            new Date(match.match_date);

        const formattedDate =
            date.toLocaleString(
                "en-US",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        const ticketId =
            match.cheapestTicket.ticket_id;

        return `
            <div class="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-xl hover:shadow-2xl ${styles.hoverShadow} transition-all duration-500 flex flex-col justify-between overflow-hidden group transform hover:-translate-y-2">

                <div class="h-2.5 ${styles.headerGradient} w-full"></div>

                <div class="p-6">

                    <div class="flex justify-between items-center mb-6">

                        <span class="${styles.badgeBg} text-slate-900 font-chakra font-bold text-xs px-4 py-1.5 rounded-full border ${styles.badgeBorder} shadow-sm">
                            ${styles.icon} ${capitalize(sport)}
                        </span>

                        <span class="font-chakra text-xs font-semibold text-stone-600 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-stone-200/60 shadow-sm flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full ${styles.pingColor} animate-ping"></span>
                            ${formattedDate}
                        </span>

                    </div>

                    <div class="text-center my-2 py-4 px-2 bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/60 shadow-inner ${styles.hoverBorder} transition-colors duration-300">

                        <h3 class="font-oswald font-bold text-2xl text-stone-900 ${styles.teamHover} transition-colors">
                            ${escapeHtml(match.home_team)}
                            <span class="${styles.vsColor} font-light text-lg mx-1">
                                VS
                            </span>
                            ${escapeHtml(match.away_team)}
                        </h3>

                    </div>

                    <p class="font-chakra text-sm text-stone-600 flex items-center justify-center gap-1.5 mt-4">
                        <span>📍</span>
                        ${escapeHtml(match.venue_name)},
                        ${escapeHtml(match.city_name)}
                    </p>

                </div>

                <div class="relative border-b-2 border-dashed border-stone-300/80 my-1">
                    <div class="absolute -left-3.5 -top-3 w-6 h-6 bg-[#FBF9F5] rounded-full border-r-2 border-stone-300/80"></div>
                    <div class="absolute -right-3.5 -top-3 w-6 h-6 bg-[#FBF9F5] rounded-full border-l-2 border-stone-300/80"></div>
                </div>

                <div class="p-6 pt-3 bg-white/40">

                    <a href="ticket.html?id=${ticketId}"
                       class="w-full ${styles.buttonBg} ${styles.buttonHover} text-slate-950 font-chakra font-bold text-sm py-3.5 px-5 rounded-2xl flex justify-between items-center transition-all duration-300 shadow-sm hover:shadow-md border ${styles.buttonBorder}">

                        <span>
                            Starting from $${Number(
                                match.cheapestTicket.price
                            ).toLocaleString()}
                        </span>

                        <span class="text-lg transform group-hover:translate-x-2 transition-transform duration-300">
                            &rarr;
                        </span>

                    </a>

                </div>

            </div>
        `;
    }

    function getSportStyles(sport) {

        if (sport === "football") {
            return {
                icon: "⚽",
                badgeBg: "bg-[#D6F5E3]",
                badgeBorder: "border-[#82D6A5]/60",
                headerGradient:
                    "bg-gradient-to-r from-[#D6F5E3] via-[#82D6A5] to-[#D6F5E3]",
                hoverShadow:
                    "hover:shadow-[#82D6A5]/30",
                hoverBorder:
                    "group-hover:border-[#82D6A5]/60",
                teamHover:
                    "group-hover:text-emerald-800",
                vsColor:
                    "text-[#82D6A5]",
                buttonBg:
                    "bg-[#D6F5E3]",
                buttonHover:
                    "hover:bg-[#82D6A5]",
                buttonBorder:
                    "border-[#82D6A5]/60",
                pingColor:
                    "bg-[#82D6A5]"
            };
        }

        if (sport === "volleyball") {
            return {
                icon: "🏐",
                badgeBg: "bg-[#D9EAFB]",
                badgeBorder: "border-[#80B6E9]/60",
                headerGradient:
                    "bg-gradient-to-r from-[#D9EAFB] via-[#80B6E9] to-[#D9EAFB]",
                hoverShadow:
                    "hover:shadow-[#80B6E9]/30",
                hoverBorder:
                    "group-hover:border-[#80B6E9]/60",
                teamHover:
                    "group-hover:text-blue-800",
                vsColor:
                    "text-[#80B6E9]",
                buttonBg:
                    "bg-[#D9EAFB]",
                buttonHover:
                    "hover:bg-[#80B6E9]",
                buttonBorder:
                    "border-[#80B6E9]/60",
                pingColor:
                    "bg-[#80B6E9]"
            };
        }

        return {
            icon: "🏀",
            badgeBg: "bg-[#FDE2D3]",
            badgeBorder: "border-[#F69664]/60",
            headerGradient:
                "bg-gradient-to-r from-[#FDE2D3] via-[#F69664] to-[#FDE2D3]",
            hoverShadow:
                "hover:shadow-[#F69664]/30",
            hoverBorder:
                "group-hover:border-[#F69664]/60",
            teamHover:
                "group-hover:text-orange-800",
            vsColor:
                "text-[#F69664]",
            buttonBg:
                "bg-[#FDE2D3]",
            buttonHover:
                "hover:bg-[#F69664]",
            buttonBorder:
                "border-[#F69664]/60",
            pingColor:
                "bg-[#F69664]"
        };
    }

    function createLoadingCards() {

        return Array(3)
            .fill(0)
            .map(
                () => `
                <div class="bg-white rounded-3xl border border-stone-200 shadow-lg h-[340px] animate-pulse"></div>
            `
            )
            .join("");
    }

    function capitalize(text) {

        if (!text) return "";

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent = text ?? "";

        return div.innerHTML;
    }
});