import { reportProblem, getUserReports } from "../services/api.js";
import { getUserData, getAccessToken } from "../utils/storage.js";

document.addEventListener("DOMContentLoaded", () => {
    initReportPage();
});


/* ============================================================
   PAGE INITIALIZATION
============================================================ */

async function initReportPage() {
    const token = getAccessToken();
    const user = getUserData();

    // User must be logged in
    if (!token || !user) {
        window.location.href = "../login.html";
        return;
    }

    // Only spectators can submit reports
    if (user.role !== "spectator") {
        showMessage(
            "You do not have permission to access the report page.",
            "error"
        );

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);

        return;
    }

    setupTabs();
    setupReportForm();

    // Load real reports from backend
    await loadReports();
}


/* ============================================================
   TABS
============================================================ */

function setupTabs() {
    const newButton = document.getElementById("tab-btn-new");
    const historyButton = document.getElementById("tab-btn-history");

    if (newButton) {
        newButton.addEventListener("click", () => {
            switchTab("new");
        });
    }

    if (historyButton) {
        historyButton.addEventListener("click", () => {
            switchTab("history");
        });
    }
}


function switchTab(tab) {
    const tabNew = document.getElementById("tab-content-new");
    const tabHistory = document.getElementById("tab-content-history");

    const btnNew = document.getElementById("tab-btn-new");
    const btnHistory = document.getElementById("tab-btn-history");

    if (!tabNew || !tabHistory || !btnNew || !btnHistory) {
        return;
    }

    if (tab === "new") {
        tabNew.classList.remove("hidden");
        tabHistory.classList.add("hidden");

        btnNew.className =
            "px-5 py-2 rounded-xl text-xs font-bold transition-all bg-white text-stone-900 shadow-sm";

        btnHistory.className =
            "px-5 py-2 rounded-xl text-xs font-bold transition-all text-stone-500 hover:text-stone-900";
    } else {
        tabNew.classList.add("hidden");
        tabHistory.classList.remove("hidden");

        btnHistory.className =
            "px-5 py-2 rounded-xl text-xs font-bold transition-all bg-white text-stone-900 shadow-sm";

        btnNew.className =
            "px-5 py-2 rounded-xl text-xs font-bold transition-all text-stone-500 hover:text-stone-900";
    }
}


/* ============================================================
   REPORT FORM
============================================================ */

function setupReportForm() {
    const form = document.getElementById("report-form");

    if (!form) {
        console.error("Report form not found.");
        return;
    }

    form.addEventListener("submit", handleReportSubmit);
}


async function handleReportSubmit(event) {
    event.preventDefault();

    const ticketInput = document.getElementById("ticket-id");
    const subjectInput = document.getElementById("issue-type");
    const descriptionInput = document.getElementById("description");

    if (!ticketInput || !subjectInput || !descriptionInput) {
        showMessage(
            "Report form fields could not be found.",
            "error"
        );
        return;
    }

    const ticketId = Number(ticketInput.value);
    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();

    /* -----------------------------
       Frontend validation
    ----------------------------- */

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
        showMessage(
            "Please enter a valid Ticket ID.",
            "error"
        );

        ticketInput.focus();
        return;
    }

    if (subject.length < 3) {
        showMessage(
            "Subject must be at least 3 characters long.",
            "error"
        );

        subjectInput.focus();
        return;
    }

    if (description.length < 10) {
        showMessage(
            "Description must be at least 10 characters long.",
            "error"
        );

        descriptionInput.focus();
        return;
    }

    if (description.length > 2000) {
        showMessage(
            "Description cannot exceed 2000 characters.",
            "error"
        );

        descriptionInput.focus();
        return;
    }

    /* -----------------------------
       Disable submit while sending
    ----------------------------- */

    const submitButton = document.querySelector(
        '#report-form button[type="submit"]'
    );

    const originalButtonText = submitButton
        ? submitButton.innerHTML
        : null;

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add("opacity-60", "cursor-not-allowed");

        submitButton.innerHTML = `
            Sending...
        `;
    }

    try {
        /* -----------------------------
           Send REAL request to backend
        ----------------------------- */

        const response = await reportProblem({
            ticket_id: ticketId,
            subject: subject,
            description: description
        });

        console.log("Report created:", response);

        showMessage(
            "Your report has been submitted successfully.",
            "success"
        );

        // Clear form
        document.getElementById("report-form").reset();

        // Reload real reports from backend
        await loadReports();

    } catch (error) {
        console.error("Report submission failed:", error);

        showMessage(
            error.message || "Failed to submit report.",
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove(
                "opacity-60",
                "cursor-not-allowed"
            );

            submitButton.innerHTML = originalButtonText;
        }
    }
}


/* ============================================================
   LOAD REPORT HISTORY
============================================================ */

async function loadReports() {
    const reportsList = document.getElementById("reports-list");
    const reportsCount = document.getElementById("reports-count");

    if (!reportsList) {
        console.error("Reports list element not found.");
        return;
    }

    // Loading state
    reportsList.innerHTML = `
        <div class="text-center py-10 text-stone-400 text-sm font-medium">
            Loading your reports...
        </div>
    `;

    try {
        const reports = await getUserReports();

        console.log("Reports received:", reports);

        const reportArray = Array.isArray(reports)
            ? reports
            : [];

        // Update count
        if (reportsCount) {
            reportsCount.textContent = reportArray.length;
        }

        // Empty state
        if (reportArray.length === 0) {
            reportsList.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-4xl mb-3">📭</div>

                    <h3 class="font-oswald text-lg font-bold text-stone-700 uppercase">
                        No Reports Yet
                    </h3>

                    <p class="text-xs text-stone-400 mt-2">
                        You haven't submitted any reports yet.
                    </p>
                </div>
            `;

            return;
        }

        // Render real reports
        reportsList.innerHTML = reportArray
            .map((report) => createReportCard(report))
            .join("");

    } catch (error) {
        console.error("Failed to load reports:", error);

        if (reportsCount) {
            reportsCount.textContent = "0";
        }

        reportsList.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-2xl p-5">
                <p class="text-sm font-bold text-red-600">
                    Failed to load your reports.
                </p>

                <p class="text-xs text-red-500 mt-1">
                    ${escapeHTML(error.message || "Something went wrong.")}
                </p>

                <button
                    type="button"
                    id="retry-reports"
                    class="mt-4 px-4 py-2 rounded-xl bg-[#F69664] text-white text-xs font-bold"
                >
                    Try Again
                </button>
            </div>
        `;

        const retryButton = document.getElementById("retry-reports");

        if (retryButton) {
            retryButton.addEventListener("click", loadReports);
        }
    }
}


/* ============================================================
   REPORT CARD
============================================================ */

function createReportCard(report) {
    const status = normalizeStatus(report.status);

    const statusConfig = getStatusConfig(status);

    const reportId = report.report_id ?? "-";
    const ticketId = report.ticket_id ?? "-";
    const subject = report.subject ?? "No subject";
    const description = report.description ?? "";
    const adminResponse = report.admin_response;

    const createdAt = formatDate(report.created_at);

    return `
        <div class="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3 relative overflow-hidden">

            <!-- Status color -->
            <div
                class="absolute top-0 left-0 bottom-0 w-1.5 ${statusConfig.barClass}"
            ></div>

            <!-- Header -->
            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-stone-200/60 pb-3">

                <div class="flex items-center gap-2 flex-wrap">

                    <span class="text-xs font-bold text-stone-700">
                        #R-${escapeHTML(String(reportId))}
                    </span>

                    <span class="text-xs text-stone-400">
                        | Ticket #${escapeHTML(String(ticketId))}
                    </span>

                </div>

                <span class="px-3 py-1 rounded-full text-[11px] font-bold ${statusConfig.badgeClass}">
                    ${escapeHTML(statusConfig.label)}
                </span>

            </div>

            <!-- Subject -->
            <div>
                <p class="text-[11px] text-stone-400 uppercase tracking-wider font-bold">
                    Subject
                </p>

                <p class="text-sm text-stone-700 font-bold mt-1">
                    ${escapeHTML(subject)}
                </p>
            </div>

            <!-- Description -->
            <div>
                <p class="text-[11px] text-stone-400 uppercase tracking-wider font-bold">
                    Description
                </p>

                <p class="text-xs text-stone-600 font-medium mt-1 leading-relaxed">
                    ${escapeHTML(description)}
                </p>
            </div>

            <!-- Date -->
            <div class="text-[10px] text-stone-400 font-medium">
                Submitted: ${escapeHTML(createdAt)}
            </div>

            <!-- Admin Response -->
            ${
                adminResponse
                    ? `
                        <div class="bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-700">
                            <span class="font-bold text-[#80B6E9] block mb-1">
                                Support Reply:
                            </span>

                            <span class="leading-relaxed">
                                ${escapeHTML(adminResponse)}
                            </span>
                        </div>
                    `
                    : `
                        <div class="bg-stone-100 border border-stone-200 rounded-xl p-3 text-xs text-stone-400">
                            <span class="font-bold block mb-1">
                                Support Reply:
                            </span>

                            <span>
                                No response from support yet.
                            </span>
                        </div>
                    `
            }

        </div>
    `;
}


/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(status) {
    if (!status) {
        return "open";
    }

    return String(status).toLowerCase().trim();
}


function getStatusConfig(status) {
    switch (status) {

        case "closed":
            return {
                label: "Closed",
                barClass: "bg-[#82D6A5]",
                badgeClass: "bg-[#D6F5E3] text-[#276e44]"
            };

        case "in_progress":
            return {
                label: "In Progress",
                barClass: "bg-[#80B6E9]",
                badgeClass: "bg-[#D9EAFB] text-[#4A90E2]"
            };

        case "open":
        default:
            return {
                label: "Open",
                barClass: "bg-[#F69664]",
                badgeClass: "bg-[#FDE8D3] text-[#b8501b]"
            };
    }
}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(message, type) {
    const messageBox = document.getElementById("report-message");

    if (!messageBox) {
        return;
    }

    messageBox.classList.remove(
        "hidden",
        "bg-green-50",
        "border-green-200",
        "text-green-700",
        "bg-red-50",
        "border-red-200",
        "text-red-700"
    );

    messageBox.classList.add("border");

    if (type === "success") {
        messageBox.classList.add(
            "bg-green-50",
            "border-green-200",
            "text-green-700"
        );
    } else {
        messageBox.classList.add(
            "bg-red-50",
            "border-red-200",
            "text-red-700"
        );
    }

    messageBox.textContent = message;

    // Automatically hide success message
    if (type === "success") {
        setTimeout(() => {
            messageBox.classList.add("hidden");
        }, 5000);
    }
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(dateValue) {
    if (!dateValue) {
        return "Unknown date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleString();
}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}