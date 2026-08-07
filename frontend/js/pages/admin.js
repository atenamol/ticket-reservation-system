import { requireAdmin } from '../utils/authGuard.js';
import {
    getCancellationRequests, updateCancellation,
    getReports, updateReport, getSuspiciousPayments
} from '../services/api.js';
import {
    formatCurrency, formatDate,
    getStatusBadgeClass, formatStatusText
} from '../utils/helpers.js';

// --- Global State ---
let state = {
    cancellations: [],
    reports: [],
    payments: [],
    activeTab: 'cancellations'
};

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAdmin()) return;

    // Issue 5: Global Logout Handler
    document.querySelectorAll('#logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = '../index.html'; // Adjust based on your auth setup
        });
    });

    const isManagementPage = document.getElementById('cancellations-tbody') !== null;

    if (isManagementPage) {
        initManagementPage();
    } else {
        initDashboardPage();
    }
});

// Comprehensive metrics calculation from dynamic database results
// Calculate metrics directly matching transaction_schema.py
function calculateMetrics(cancellations, reports, payments) {
    return {
        // Cancellations (AdminCancellationItem.status)
        pendingCancellations: cancellations.filter(c => c.status === 'pending').length,
        approvedCancellations: cancellations.filter(c => c.status === 'approved').length,
        rejectedCancellations: cancellations.filter(c => c.status === 'rejected').length,
        totalCancellations: cancellations.length,

        // Reports (AdminReportItem.status)
        openReports: reports.filter(r => r.status === 'open').length,
        inProgressReports: reports.filter(r => r.status === 'in_progress').length,
        closedReports: reports.filter(r => r.status === 'closed').length,
        totalReports: reports.length,

        // Suspicious Payments (SuspiciousPaymentItem.payment_status)
        pendingPayments: payments.filter(p => p.payment_status === 'pending').length,
        completedPayments: payments.filter(p => p.payment_status === 'completed').length,
        failedPayments: payments.filter(p => p.payment_status === 'failed').length,
        totalSuspicious: payments.length
    };
}

/* ============================================================
    Dashboard Page Logic
============================================================ */
// Helper for safe text updates
function updateDOMElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value !== undefined && value !== null ? value : '--';
}

async function initDashboardPage() {
    await loadDashboardData();
    // Issue 7: Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
}

export async function loadDashboardData() {
    try {
        const [cancellations, reports, payments] = await Promise.all([
            getCancellationRequests().catch(() => []),
            getReports().catch(() => []),
            getSuspiciousPayments().catch(() => [])
        ]);

        const metrics = calculateMetrics(cancellations, reports, payments);

        // Header / Main Card Counts
        updateDOMElement('cancel-main-count', metrics.pendingCancellations);
        updateDOMElement('reports-main-count', metrics.openReports);
        updateDOMElement('payments-main-count', metrics.totalSuspicious);

        // Macro Overview Totals
        updateDOMElement('stat-total-cancellations', metrics.totalCancellations);
        updateDOMElement('stat-total-reports', metrics.totalReports);
        updateDOMElement('stat-total-payments', metrics.totalSuspicious);

        // Reports Breakdown
        updateDOMElement('report-sub-open', metrics.openReports);
        updateDOMElement('report-sub-inprogress', metrics.inProgressReports);
        updateDOMElement('report-sub-closed', metrics.closedReports);

        // Cancellations Breakdown
        updateDOMElement('cancel-sub-pending', metrics.pendingCancellations);
        updateDOMElement('cancel-sub-approved', metrics.approvedCancellations);
        updateDOMElement('cancel-sub-rejected', metrics.rejectedCancellations);

        // Payments Breakdown
        updateDOMElement('payment-sub-pending', metrics.pendingPayments);
        updateDOMElement('payment-sub-completed', metrics.completedPayments);
        updateDOMElement('payment-sub-failed', metrics.failedPayments);

    } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
    }
}

function renderActivityFeed(cancellations, reports, payments) {
    const feedContainer = document.getElementById('activity-feed');
    if (!feedContainer) return;

    const activities = [
        ...reports.map(r => ({ type: 'report', title: 'Report Submitted', desc: `Report #${r.report_id}`, icon: 'messages-square', bg: '#D9EAFB', text: '#80B6E9' })),
        ...cancellations.map(c => ({ type: 'cancellation', title: 'Cancellation Requested', desc: `Cancel #${c.cancel_id}`, icon: 'ticket-x', bg: '#D6F5E3', text: '#4AA96C' })),
        ...payments.map(p => ({ type: 'payment', title: 'Suspicious Payment', desc: `Transaction #${p.payment_id}`, icon: 'shield-alert', bg: '#FDE2D3', text: '#F69664' }))
    ];

    // Take the 4 most recent events (assuming they are appended to the arrays over time)
    const recentActivities = activities.slice(0, 4);

    if (recentActivities.length === 0) {
        feedContainer.innerHTML = `<p class="text-sm text-stone-500">No recent activity found.</p>`;
        return;
    }

    feedContainer.innerHTML = recentActivities.map(act => `
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background-color: ${act.bg}; color: ${act.text}">
                <i data-lucide="${act.icon}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-stone-800 truncate">${act.title}</p>
                <p class="text-xs text-stone-400">${act.desc}</p>
            </div>
        </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons(); // Render newly injected icons
}

/* ============================================================
    Management Page Logic
============================================================ */
function initManagementPage() {
    document.getElementById('global-search')?.addEventListener('input', renderActiveTab);
    document.getElementById('status-filter')?.addEventListener('change', renderActiveTab);

    // Issue 6: Parse URL parameters to open specific tabs automatically
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTab = urlParams.get('tab');
    if (requestedTab && ['cancellations', 'reports', 'payments'].includes(requestedTab)) {
        state.activeTab = requestedTab;
        if (typeof window.switchTab === 'function') {
            window.switchTab(requestedTab);
        }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.id.replace('tab-btn-', '');
            state.activeTab = tabId;
            renderActiveTab();
        });
    });

    document.getElementById('cancellation-form')?.addEventListener('submit', handleCancellationSubmit);
    document.getElementById('report-form')?.addEventListener('submit', handleReportSubmit);

    refreshAllData();

    // Issue 7: Auto-refresh every 30 seconds
    setInterval(refreshAllData, 30000);
}

async function refreshAllData() {
    try {
        const [cancellations, reports, payments] = await Promise.all([
            getCancellationRequests(),
            getReports(),
            getSuspiciousPayments()
        ]);

        state.cancellations = cancellations || [];
        state.reports = reports || [];
        state.payments = payments || [];

        // Leverage the DRY calculateMetrics function
        const metrics = calculateMetrics(state.cancellations, state.reports, state.payments);
        updateDOMElement('badge-cancellations-count', metrics.pendingCancellations);
        updateDOMElement('badge-reports-count', metrics.openReports);
        updateDOMElement('badge-payments-count', metrics.totalSuspicious);

        renderActiveTab();
    } catch (error) {
        console.error("Error refreshing data:", error);
    }
}

function renderActiveTab() {
    switch (state.activeTab) {
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

function filterItems(items) {
    const search =
        (document.getElementById("global-search")?.value || "")
            .toLowerCase();

    const status =
        document.getElementById("status-filter")?.value || "all";

    return items.filter(item => {

        const matchesStatus =
            status === "all" ||
            item.status === status ||
            item.payment_status === status;

        const matchesSearch =
            JSON.stringify(item)
                .toLowerCase()
                .includes(search);

        return matchesStatus && matchesSearch;
    });
}

function renderCancellations() {

    const tbody =
        document.getElementById("cancellations-tbody");

    if (!tbody) return;

    const data = filterItems(state.cancellations);

    if (!data.length) {
        tbody.innerHTML =
            `<tr>
                <td colspan="7" class="p-6 text-center text-slate-400">
                    No cancellation requests.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
<tr>
<td class="p-4">${item.cancel_id}</td>
<td class="p-4">${item.user_name ?? item.user_id}</td>
<td class="p-4">${item.reservation_id}</td>
<td class="p-4">${formatCurrency(item.penalty_amount)}</td>
<td class="p-4">${formatCurrency(item.refund_amount)}</td>
<td class="p-4">
<span class="${getStatusBadgeClass(item.status)}">
${formatStatusText(item.status)}
</span>
</td>
<td class="p-4 text-right">
<button
class="review-cancel px-3 py-1 rounded bg-slate-900 text-white"
data-id="${item.cancel_id}">
Review
</button>
</td>
</tr>
`).join("");

    document.querySelectorAll(".review-cancel")
        .forEach(btn => {
            btn.onclick = () =>
                openCancellationModal(
                    Number(btn.dataset.id)
                );
        });
}

function renderReports() {

    const tbody =
        document.getElementById("reports-tbody");

    if (!tbody) return;

    const data = filterItems(state.reports);

    if (!data.length) {
        tbody.innerHTML =
            `<tr>
                <td colspan="7" class="p-6 text-center text-slate-400">
                    No reports found.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
<tr>
<td class="p-4">${item.report_id}</td>
<td class="p-4">${item.user_name ?? item.user_id}</td>
<td class="p-4">${item.ticket_id}</td>
<td class="p-4">${item.subject}</td>
<td class="p-4">
<span class="${getStatusBadgeClass(item.status)}">
${formatStatusText(item.status)}
</span>
</td>
<td class="p-4">${formatDate(item.created_at)}</td>
<td class="p-4 text-right">
<button
class="review-report px-3 py-1 rounded bg-slate-900 text-white"
data-id="${item.report_id}">
Open
</button>
</td>
</tr>
`).join("");

    document.querySelectorAll(".review-report")
        .forEach(btn => {
            btn.onclick = () =>
                openReportModal(
                    Number(btn.dataset.id)
                );
        });
}

async function handleReportSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("report-id").value;
    const status = document.getElementById("report-status").value;

    try {
        await updateReport(id, { status });

        await refreshAllData();

        e.target.reset();

        alert("Report updated successfully.");
    } catch (err) {
        alert(err.message);
    }
}

/* ============================================================
   PAYMENTS
============================================================ */

function renderPayments() {
    const tbody = document.getElementById("payments-tbody");
    if (!tbody) return;

    const rows = getFilteredItems(
        state.payments,
        ["payment_id", "user_name", "gateway", "reference_number"]
    );

    if (!rows.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-6 text-stone-500">
                    No suspicious payments found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rows.map(item => `
        <tr>
            <td>${item.payment_id}</td>
            <td>${item.user_name ?? "-"}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td>${item.gateway ?? "-"}</td>
            <td>
                <span class="${getStatusBadgeClass(item.payment_status)}">
                    ${formatStatusText(item.payment_status)}
                </span>
            </td>
            <td>${formatDate(item.payment_date)}</td>
        </tr>
    `).join("");
}

/* ============================================================
   TAB SWITCHING
============================================================ */

window.switchTab = function(tab) {

    state.activeTab = tab;

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document
        .getElementById(`tab-btn-${tab}`)
        ?.classList.add("active");

    document
        .getElementById("cancellations-section")
        ?.classList.add("hidden");

    document
        .getElementById("reports-section")
        ?.classList.add("hidden");

    document
        .getElementById("payments-section")
        ?.classList.add("hidden");

    document
        .getElementById(`${tab}-section`)
        ?.classList.remove("hidden");

    renderActiveTab();
};