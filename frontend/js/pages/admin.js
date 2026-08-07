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
    activeTab: 'cancellations' // Defaults to cancellations[cite: 8]
};

/**
 * Main Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check: Redirect non-admins[cite: 11]
    if (!requireAdmin()) return;

    // 2. Identify Page Context
    const isManagementPage = document.getElementById('cancellations-tbody') !== null;

    if (isManagementPage) {
        initManagementPage();
    } else {
        initDashboardPage();
    }
});


/* ============================================================
    Dashboard Page Logic
============================================================ */
async function initDashboardPage() {
    try {
        // Fetch all data to calculate metrics for dashboard cards[cite: 15]
        const [cancellations, reports, payments] = await Promise.all([
            getCancellationRequests().catch(() => []),
            getReports().catch(() => []),
            getSuspiciousPayments().catch(() => [])
        ]);

        // Calculate pending metrics
        const pendingCancellations = cancellations.filter(c => c.status === 'pending').length;
        const openReports = reports.filter(r => r.status === 'open').length;
        const totalSuspicious = payments.length;

        // Update dashboard DOM if elements exist
        updateDOMElement('dash-cancellations-count', pendingCancellations);
        updateDOMElement('dash-reports-count', openReports);
        updateDOMElement('dash-payments-count', totalSuspicious);

    } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
    }
}


/* ============================================================
    Management Page Logic
============================================================ */
function initManagementPage() {
    // Setup UI event listeners[cite: 8]
    document.getElementById('global-search')?.addEventListener('input', renderActiveTab);
    document.getElementById('status-filter')?.addEventListener('change', renderActiveTab);

    // Bind Tab buttons to update state (the visual tab switch is handled in inline script)[cite: 8]
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.id.replace('tab-btn-', '');
            state.activeTab = tabId;
            renderActiveTab();
        });
    });

    // Form Submissions[cite: 8]
    document.getElementById('cancellation-form')?.addEventListener('submit', handleCancellationSubmit);
    document.getElementById('report-form')?.addEventListener('submit', handleReportSubmit);

    // Initial Data Fetch
    refreshAllData();
}

/**
 * Fetches all backend data simultaneously and updates UI badges.
 */
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

        // Update Tab Badges[cite: 8]
        updateDOMElement('badge-cancellations-count', state.cancellations.filter(c => c.status === 'pending').length);
        updateDOMElement('badge-reports-count', state.reports.filter(r => r.status === 'open').length);
        updateDOMElement('badge-payments-count', state.payments.length);

        renderActiveTab();
    } catch (error) {
        console.error("Error refreshing data:", error);
        alert("Failed to load management data. Please try again.");
    }
}

/**
 * Filters and renders the currently active tab based on search/filter inputs.
 */
function renderActiveTab() {
    const searchTerm = document.getElementById('global-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || 'all';

    if (state.activeTab === 'cancellations') {
        const filtered = state.cancellations.filter(item =>
            // Changed 'id' to 'cancel_id'
            matchesSearch(item, searchTerm, ['cancel_id', 'user_id', 'reservation_id']) &&
            matchesStatus(item.status, statusFilter)
        );
        renderCancellationsTable(filtered);
    }
    else if (state.activeTab === 'reports') {
        const filtered = state.reports.filter(item =>
            // Changed 'id' to 'report_id'
            matchesSearch(item, searchTerm, ['report_id', 'user_id', 'ticket_id', 'subject']) &&
            matchesStatus(item.status, statusFilter)
        );
        renderReportsTable(filtered);
    }
    else if (state.activeTab === 'payments') {
        const filtered = state.payments.filter(item =>
            // Changed 'id' to 'payment_id'
            matchesSearch(item, searchTerm, ['payment_id', 'user_id', 'reservation_id']) &&
            matchesStatus(item.status, statusFilter)
        );
        renderPaymentsTable(filtered);
    }
}


/* ============================================================
    Table Renderers
============================================================ */

function renderCancellationsTable(data) {
    const tbody = document.getElementById('cancellations-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400">No cancellations found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 font-price text-slate-600">#${item.cancel_id}</td>
            <td class="p-4 font-medium text-slate-900">${item.user_id}</td>
            <td class="p-4 text-slate-500">${item.reservation_id}</td>
            <td class="p-4 font-price text-red-500">${item.penalty_percent}%</td>
            <td class="p-4 font-price text-emerald-600">${formatCurrency(item.refund_amount)}</td>
            <td class="p-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}">
                    ${formatStatusText(item.status)}
                </span>
            </td>
            <td class="p-4 text-right">
                <button onclick="window.openCancellationModal('${item.cancel_id}')" 
                        class="text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition">
                    Review
                </button>
            </td>
        </tr>
    `).join('');
}

function renderReportsTable(data) {
    const tbody = document.getElementById('reports-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400">No reports found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 font-price text-slate-600">#${item.report_id}</td>
            <td class="p-4 font-medium text-slate-900">${item.user_id}</td>
            <td class="p-4 text-slate-500">${item.ticket_id || 'N/A'}</td>
            <td class="p-4 font-medium text-slate-700">${item.subject}</td>
            <td class="p-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}">
                    ${formatStatusText(item.status)}
                </span>
            </td>
            <td class="p-4 text-slate-500 text-sm">${formatDate(item.created_at)}</td>
            <td class="p-4 text-right">
                <button onclick="window.openReportModal('${item.report_id}')" 
                        class="text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition">
                    Resolve
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPaymentsTable(data) {
    const tbody = document.getElementById('payments-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400">No suspicious payments found.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 font-price text-slate-600">#${item.payment_id}</td>
            <td class="p-4 font-medium text-slate-900">${item.user_id}</td>
            <td class="p-4 text-slate-500">${item.reservation_id}</td>
            <td class="p-4 font-price text-slate-900">${formatCurrency(item.amount)}</td>
            <td class="p-4 text-slate-600">${formatStatusText(item.payment_method)}</td>
            <td class="p-4 text-slate-500 text-sm">${formatDate(item.transaction_date)}</td>
            <td class="p-4 text-right">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    Flagged
                </span>
            </td>
        </tr>
    `).join('');
}


/* ============================================================
    Modal Handlers & Submissions
============================================================ */

// Attach functions to window so inline HTML triggers can access them[cite: 8]
window.refreshActiveTab = refreshAllData;

window.openCancellationModal = (id) => {
    // Look up by cancel_id
    const item = state.cancellations.find(c => c.cancel_id == id);
    if (!item) return;

    // Populate modal data
    document.getElementById('modal-cancel-id').textContent = item.cancel_id;
    document.getElementById('modal-cancel-user').textContent = item.user_id;
    document.getElementById('modal-cancel-reservation').textContent = item.reservation_id;

    // Formatted as percentage
    document.getElementById('modal-cancel-penalty').textContent = `${item.penalty_percent}%`;
    document.getElementById('modal-cancel-refund').textContent = formatCurrency(item.refund_amount);

    // Set form inputs
    document.getElementById('modal-cancel-id-input').value = item.cancel_id;
    document.getElementById('modal-cancel-status').value = item.status === 'pending' ? 'approved' : item.status;

    document.getElementById('cancellation-modal').classList.remove('hidden');
};

window.closeCancellationModal = () => {
    document.getElementById('cancellation-modal').classList.add('hidden');
};

window.openReportModal = (id) => {
    // Look up by report_id
    const item = state.reports.find(r => r.report_id == id);
    if (!item) return;

    // Populate modal data
    document.getElementById('modal-report-id').textContent = item.report_id;
    document.getElementById('modal-report-user').textContent = item.user_id;
    document.getElementById('modal-report-ticket').textContent = item.ticket_id || 'General';
    document.getElementById('modal-report-subject').textContent = item.subject;
    document.getElementById('modal-report-description').textContent = item.description || 'No description provided.';

    // Set form inputs
    document.getElementById('modal-report-id-input').value = item.report_id;
    document.getElementById('modal-report-status').value = item.status;
    document.getElementById('modal-report-response').value = item.admin_response || '';

    document.getElementById('report-modal').classList.remove('hidden');
};

window.closeReportModal = () => {
    document.getElementById('report-modal').classList.add('hidden');
};


// Form Submit Listeners
async function handleCancellationSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-cancel-id-input').value;
    const status = document.getElementById('modal-cancel-status').value;

    try {
        await updateCancellation(id, { status });
        alert('Cancellation updated successfully.');
        window.closeCancellationModal();
        refreshAllData();
    } catch (error) {
        alert(error.message || 'Failed to update cancellation.');
    }
}

async function handleReportSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('modal-report-id-input').value;
    const status = document.getElementById('modal-report-status').value;
    const admin_response = document.getElementById('modal-report-response').value;

    try {
        await updateReport(id, { status, admin_response });
        alert('Report resolved successfully.');
        window.closeReportModal();
        refreshAllData();
    } catch (error) {
        alert(error.message || 'Failed to update report.');
    }
}


/* ============================================================
    Helper Utilities for Filtering
============================================================ */

function updateDOMElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function matchesSearch(item, term, fields) {
    if (!term) return true;
    return fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(term);
    });
}

function matchesStatus(itemStatus, filterStatus) {
    if (filterStatus === 'all') return true;
    return (itemStatus || '').toLowerCase() === filterStatus;
}
