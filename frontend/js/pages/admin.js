import { requireAdmin } from "../utils/authGuard.js";

import {
    getCancellationRequests,
    updateCancellation,
    getReports,
    updateReport,
    getSuspiciousPayments
} from "../services/api.js";

import {
    formatCurrency,
    formatDate,
    getStatusBadgeClass,
    formatStatusText
} from "../utils/helpers.js";

/* ==========================================================
   GLOBAL STATE
========================================================== */

const state = {
    cancellations: [],
    reports: [],
    payments: [],
    activeTab: "cancellations"
};

/* ==========================================================
   STARTUP
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    if (!requireAdmin()) return;

    setupLogout();

    const managementPage =
        document.getElementById("cancellations-tbody") !== null;

    if (managementPage)
        initManagementPage();
    else
        initDashboardPage();

});

/* ==========================================================
   LOGOUT
========================================================== */

function setupLogout() {

    document
        .querySelectorAll("#logout-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href = "../index.html";

            });

        });

}

/* ==========================================================
   DASHBOARD
========================================================== */

async function initDashboardPage() {

    await loadDashboard();

    setInterval(loadDashboard, 30000);

}

async function loadDashboard() {

    try {

        const [
            cancellations,
            reports,
            payments
        ] = await Promise.all([

            getCancellationRequests(),
            getReports(),
            getSuspiciousPayments()

        ]);

        const metrics =
            calculateMetrics(
                cancellations,
                reports,
                payments
            );

        updateText("cancel-main-count",
            metrics.pendingCancellations);

        updateText("reports-main-count",
            metrics.openReports);

        updateText("payments-main-count",
            metrics.totalPayments);

        updateText("stat-total-cancellations",
            metrics.totalCancellations);

        updateText("stat-total-reports",
            metrics.totalReports);

        updateText("stat-total-payments",
            metrics.totalPayments);

        updateText("cancel-sub-pending",
            metrics.pendingCancellations);

        updateText("cancel-sub-approved",
            metrics.approvedCancellations);

        updateText("cancel-sub-rejected",
            metrics.rejectedCancellations);

        updateText("report-sub-open",
            metrics.openReports);

        updateText("report-sub-inprogress",
            metrics.inProgressReports);

        updateText("report-sub-closed",
            metrics.closedReports);

        updateText("payment-sub-pending",
            metrics.pendingPayments);

        updateText("payment-sub-completed",
            metrics.completedPayments);

        updateText("payment-sub-failed",
            metrics.failedPayments);

        renderActivityFeed(
            cancellations,
            reports,
            payments
        );

    }

    catch (err) {

        console.error(err);

    }

}

/* ==========================================================
   METRICS
========================================================== */

function calculateMetrics(
    cancellations,
    reports,
    payments
) {

    return {

        totalCancellations:
        cancellations.length,

        pendingCancellations:
        cancellations.filter(c =>
            c.status === "pending").length,

        approvedCancellations:
        cancellations.filter(c =>
            c.status === "approved").length,

        rejectedCancellations:
        cancellations.filter(c =>
            c.status === "rejected").length,

        totalReports:
        reports.length,

        openReports:
        reports.filter(r =>
            r.status === "open").length,

        inProgressReports:
        reports.filter(r =>
            r.status === "in_progress").length,

        closedReports:
        reports.filter(r =>
            r.status === "closed").length,

        totalPayments:
        payments.length,

        pendingPayments:
        payments.filter(p =>
            p.payment_status === "pending").length,

        completedPayments:
        payments.filter(p =>
            p.payment_status === "completed").length,

        failedPayments:
        payments.filter(p =>
            p.payment_status === "failed").length

    };

}

/* ==========================================================
   ACTIVITY FEED
========================================================== */

function renderActivityFeed(
    cancellations,
    reports,
    payments
) {

    const container =
        document.getElementById("activity-feed");

    if (!container)
        return;

    const activity = [];

    reports.forEach(r => {

        activity.push({

            icon: "messages-square",
            color: "#80B6E9",
            bg: "#D9EAFB",

            title: "New Report",

            text:
                `Report #${r.report_id}`

        });

    });

    cancellations.forEach(c => {

        activity.push({

            icon: "ticket-x",
            color: "#4AA96C",
            bg: "#D6F5E3",

            title: "Cancellation Request",

            text:
                `Cancellation #${c.cancel_id}`

        });

    });

    payments.forEach(p => {

        activity.push({

            icon: "shield-alert",
            color: "#F69664",
            bg: "#FDE2D3",

            title: "Suspicious Payment",

            text:
                `Payment #${p.payment_id}`

        });

    });

    const recent = activity.slice(0, 5);

    if (!recent.length) {

        container.innerHTML = `
            <p class="text-sm text-slate-500">
                No recent activity.
            </p>
        `;

        return;

    }

    container.innerHTML = recent.map(item => `

<div class="flex items-center gap-3">

<div
class="w-10 h-10 rounded-full flex items-center justify-center"
style="
background:${item.bg};
color:${item.color};
">

<i
data-lucide="${item.icon}"
class="w-5 h-5">
</i>

</div>

<div>

<p class="font-semibold">
${item.title}
</p>

<p class="text-xs text-slate-500">
${item.text}
</p>

</div>

</div>

`).join("");

    if (window.lucide)
        lucide.createIcons();

}

/* ==========================================================
   SMALL HELPERS
========================================================== */

function updateText(id, value) {

    const el =
        document.getElementById(id);

    if (el)
        el.textContent = value;

}

/* ==========================================================
   MANAGEMENT PAGE
========================================================== */

function initManagementPage() {

    const search =
        document.getElementById("global-search");

    const filter =
        document.getElementById("status-filter");

    search?.addEventListener(
        "input",
        renderActiveTab
    );

    filter?.addEventListener(
        "change",
        renderActiveTab
    );

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.addEventListener("click", () => {

                const tab =
                    btn.id.replace(
                        "tab-btn-",
                        ""
                    );

                switchTab(tab);

            });

        });

    document
        .getElementById("cancellation-form")
        ?.addEventListener(
            "submit",
            handleCancellationSubmit
        );

    document
        .getElementById("report-form")
        ?.addEventListener(
            "submit",
            handleReportSubmit
        );

    const params =
        new URLSearchParams(
            window.location.search
        );

    const requested =
        params.get("tab");

    if (
        requested &&
        [
            "cancellations",
            "reports",
            "payments"
        ].includes(requested)
    ) {

        state.activeTab =
            requested;

        switchTab(requested);

    }

    refreshAllData();

    setInterval(
        refreshAllData,
        30000
    );

}

/* ==========================================================
   LOAD MANAGEMENT DATA
========================================================== */

async function refreshAllData() {

    try {

        const [
            cancellations,
            reports,
            payments
        ] = await Promise.all([

            getCancellationRequests(),

            getReports(),

            getSuspiciousPayments()

        ]);

        state.cancellations =
            cancellations || [];

        state.reports =
            reports || [];

        state.payments =
            payments || [];

        updateBadges();

        renderActiveTab();

    }

    catch (err) {

        console.error(err);

    }

}

/* ==========================================================
   BADGES
========================================================== */

function updateBadges() {

    updateText(

        "badge-cancellations-count",

        state.cancellations.filter(

            c => c.status === "pending"

        ).length

    );

    updateText(

        "badge-reports-count",

        state.reports.filter(

            r => r.status === "open"

        ).length

    );

    updateText(

        "badge-payments-count",

        state.payments.length

    );

}

/* ==========================================================
   TAB SWITCHING
========================================================== */

window.switchTab = switchTab;

function switchTab(tab) {

    state.activeTab = tab;

    document
        .querySelectorAll(".tab-content")
        .forEach(section => {

            section.classList.add("hidden");

        });

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => {

            btn.classList.remove(

                "border-slate-900",
                "text-slate-900",
                "bg-white",
                "shadow-sm"

            );

            btn.classList.add(

                "border-transparent",
                "text-slate-500"

            );

        });

    document
        .getElementById(
            `tab-${tab}`
        )
        ?.classList.remove(
        "hidden"
    );

    document
        .getElementById(
            `tab-btn-${tab}`
        )
        ?.classList.remove(

        "border-transparent",
        "text-slate-500"

    );

    document
        .getElementById(
            `tab-btn-${tab}`
        )
        ?.classList.add(

        "border-slate-900",
        "text-slate-900",
        "bg-white",
        "shadow-sm"

    );

    renderActiveTab();

}

/* ==========================================================
   FILTERING
========================================================== */

function getFilteredItems(items) {

    const search =

        document
            .getElementById(
                "global-search"
            )
            ?.value
            .toLowerCase()
            .trim()

        || "";

    const status =

        document
            .getElementById(
                "status-filter"
            )
            ?.value

        || "all";

    return items.filter(item => {

        const statusMatch =

            status === "all"

            ||

            item.status === status

            ||

            item.payment_status === status;

        const searchMatch =

            JSON.stringify(item)

                .toLowerCase()

                .includes(search);

        return (

            statusMatch

            &&

            searchMatch

        );

    });

}

/* ==========================================================
   ACTIVE TAB RENDER
========================================================== */

function renderActiveTab() {

    switch (

        state.activeTab

        ) {

        case "cancellations":

            renderCancellations();

            break;

        case "reports":

            renderReports();

            break;

        case "payments":

            renderPayments();

            break;

    }

}

/* ==========================================================
   GLOBAL REFRESH BUTTON
========================================================== */

window.refreshActiveTab =
    refreshAllData;

/* ==========================================================
   CANCELLATION TABLE
========================================================== */

function renderCancellations() {

    const tbody =
        document.getElementById(
            "cancellations-tbody"
        );

    if (!tbody) return;

    const rows =
        getFilteredItems(
            state.cancellations
        );

    if (!rows.length) {

        tbody.innerHTML = `
<tr>
<td colspan="7"
class="p-8 text-center text-slate-400">
No cancellation requests found.
</td>
</tr>
`;

        return;
    }

    tbody.innerHTML = rows.map(item => `

<tr>

<td class="p-4 font-price">
${item.cancel_id}
</td>

<td class="p-4">
    <span
        title="User ID: ${item.user_id}"
        class="cursor-help"
    >
        ${item.user_name ?? item.user_id}
    </span>
</td>

<td class="p-4">
${item.reservation_id}
</td>

<td class="p-4 text-red-600">
${formatCurrency(item.penalty_amount)}
</td>

<td class="p-4 text-emerald-600">
${formatCurrency(item.refund_amount)}
</td>

<td class="p-4">

<span class="${getStatusBadgeClass(item.status)}">

${formatStatusText(item.status)}

</span>

</td>

<td class="p-4 text-right">

<button
class="review-cancel
px-3
py-1
rounded-lg
bg-slate-900
hover:bg-slate-800
text-white"

data-id="${item.cancel_id}">

Review

</button>

</td>

</tr>

`).join("");

    document
        .querySelectorAll(".review-cancel")
        .forEach(btn => {

            btn.onclick = () => {

                const id =
                    Number(btn.dataset.id);

                const request =
                    state.cancellations.find(

                        c =>
                            c.cancel_id === id

                    );

                openCancellationModal(
                    request
                );

            };

        });

}

/* ==========================================================
   REPORT TABLE
========================================================== */

function renderReports() {

    const tbody =
        document.getElementById(
            "reports-tbody"
        );

    if (!tbody) return;

    const rows =
        getFilteredItems(
            state.reports
        );

    if (!rows.length) {

        tbody.innerHTML = `
<tr>
<td colspan="7"
class="p-8 text-center text-slate-400">
No reports found.
</td>
</tr>
`;

        return;

    }

    tbody.innerHTML = rows.map(item => `

<tr>

<td class="p-4">
${item.report_id}
</td>

<td class="p-4">
    <span
        title="User ID: ${item.user_id}"
        class="cursor-help"
    >
        ${item.user_name ?? item.user_id}
    </span>
</td>

<td class="p-4">
${item.ticket_id}
</td>

<td class="p-4">
${item.subject}
</td>

<td class="p-4">

<span class="${getStatusBadgeClass(item.status)}">

${formatStatusText(item.status)}

</span>

</td>

<td class="p-4">

${formatDate(item.created_at)}

</td>

<td class="p-4 text-right">

<button
class="review-report
px-3
py-1
rounded-lg
bg-slate-900
hover:bg-slate-800
text-white"

data-id="${item.report_id}">

Open

</button>

</td>

</tr>

`).join("");

    document
        .querySelectorAll(".review-report")
        .forEach(btn => {

            btn.onclick = () => {

                const id =
                    Number(btn.dataset.id);

                const report =
                    state.reports.find(

                        r =>
                            r.report_id === id

                    );

                openReportModal(
                    report
                );

            };

        });

}

/* ==========================================================
   SUSPICIOUS PAYMENTS
========================================================== */

function renderPayments() {

    const tbody =
        document.getElementById(
            "payments-tbody"
        );

    if (!tbody) return;

    const rows =
        getFilteredItems(
            state.payments
        );

    if (!rows.length) {

        tbody.innerHTML = `
<tr>
<td colspan="7"
class="p-8 text-center text-slate-400">
No suspicious payments found.
</td>
</tr>
`;

        return;

    }

    tbody.innerHTML = rows.map(item => `

<tr>

<td class="p-4">
${item.payment_id}
</td>

<td class="p-4">
    <span
        title="User ID: ${item.user_id}"
        class="cursor-help"
    >
        ${item.user_name ?? item.user_id}
    </span>
</td>

<td class="p-4">
${item.reservation_id ?? "-"}
</td>

<td class="p-4">
${formatCurrency(item.amount)}
</td>

<td class="p-4">
${item.gateway ?? "-"}
</td>

<td class="p-4">
${formatDate(item.payment_date)}
</td>

<td class="p-4">

<span class="${getStatusBadgeClass(item.payment_status)}">

${formatStatusText(item.payment_status)}

</span>

</td>

</tr>

`).join("");

}

/* ==========================================================
   CANCELLATION MODAL
========================================================== */

function openCancellationModal(request) {

    if (!request) return;

    document.getElementById("modal-cancel-id").textContent =
        request.cancel_id;

    document.getElementById("modal-cancel-id-input").value =
        request.cancel_id;

    document.getElementById("modal-cancel-user").textContent =
        request.user_name ?? request.user_id;

    document.getElementById("modal-cancel-reservation").textContent =
        request.reservation_id;

    document.getElementById("modal-cancel-penalty").textContent =
        formatCurrency(request.penalty_amount);

    document.getElementById("modal-cancel-refund").textContent =
        formatCurrency(request.refund_amount);

    document.getElementById("modal-cancel-status").value =
        request.status === "pending"
            ? "approved"
            : request.status;

    document
        .getElementById("cancellation-modal")
        .classList.remove("hidden");

}

function closeCancellationModal() {

    document
        .getElementById("cancellation-modal")
        .classList.add("hidden");

}

window.closeCancellationModal =
    closeCancellationModal;


/* ==========================================================
   REPORT MODAL
========================================================== */

function openReportModal(report) {

    if (!report) return;

    document.getElementById("modal-report-id").textContent =
        report.report_id;

    document.getElementById("modal-report-id-input").value =
        report.report_id;

    document.getElementById("modal-report-user").textContent =
        report.user_name ?? report.user_id;

    document.getElementById("modal-report-ticket").textContent =
        report.ticket_id;

    document.getElementById("modal-report-subject").textContent =
        report.subject;

    document.getElementById("modal-report-description").textContent =
        report.description ?? "-";

    document.getElementById("modal-report-status").value =
        report.status;

    document.getElementById("modal-report-response").value =
        report.admin_response ?? "";

    document
        .getElementById("report-modal")
        .classList.remove("hidden");
}

function closeReportModal() {

    document
        .getElementById("report-modal")
        .classList.add("hidden");

}

window.closeReportModal =
    closeReportModal;


/* ==========================================================
   CLICK OUTSIDE TO CLOSE
========================================================== */

document.addEventListener("click", e => {

    if (
        e.target.id === "cancellation-modal"
    ) {
        closeCancellationModal();
    }

    if (
        e.target.id === "report-modal"
    ) {
        closeReportModal();
    }

});


/* ==========================================================
   ESC KEY CLOSE
========================================================== */

document.addEventListener("keydown", e => {

    if (e.key !== "Escape")
        return;

    closeCancellationModal();

    closeReportModal();

});

/* ==========================================================
   CANCELLATION SUBMIT
========================================================== */

async function handleCancellationSubmit(e) {

    e.preventDefault();

    const id =
        document.getElementById(
            "modal-cancel-id-input"
        ).value;

    const status =
        document.getElementById(
            "modal-cancel-status"
        ).value;

    try {

        await updateCancellation(id, {
            status
        });

        closeCancellationModal();

        await refreshAllData();

        alert(
            "Cancellation updated successfully."
        );

    }

    catch (err) {

        console.error(err);

        alert(
            err.message ??
            "Failed to update cancellation."
        );

    }

}


/* ==========================================================
   REPORT SUBMIT
========================================================== */

async function handleReportSubmit(e) {

    e.preventDefault();

    const id =
        document.getElementById(
            "modal-report-id-input"
        ).value;

    const status =
        document.getElementById(
            "modal-report-status"
        ).value;

    const response =
        document.getElementById(
            "modal-report-response"
        ).value;

    try {

        await updateReport(id, {

            status,

            admin_response: response

        });

        closeReportModal();

        await refreshAllData();

        alert(
            "Report updated successfully."
        );

    }

    catch (err) {

        console.error(err);

        alert(
            err.message ??
            "Failed to update report."
        );

    }
}


/* ==========================================================
   GLOBAL HELPERS
========================================================== */

window.refreshAllData =
    refreshAllData;

window.renderActiveTab =
    renderActiveTab;


/* ==========================================================
   SAFETY
========================================================== */

window.addEventListener(
    "error",
    e => {

        console.error(
            "Admin JS:",
            e.error ?? e.message
        );

    }
);


/* ==========================================================
   END
========================================================== */