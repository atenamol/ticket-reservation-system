import { searchTickets, getCities } from '../services/api.js';
import { getAccessToken, getUserData } from '../utils/storage.js';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    initUpcomingMatches();
    initCityFilterDropdown();
});

/**
 * Fetches and renders upcoming matches dynamically into #upcoming-matches-container
 */
async function initUpcomingMatches() {
    const container = document.getElementById('upcoming-matches-container');
    if (!container) return;

    container.innerHTML = `<div class="text-center py-4 text-gray-500">Loading upcoming matches...</div>`;

    try {
        // Fetch tickets/matches using the catalog search API endpoint
        // You can pass empty filters or initial date filters to get upcoming matches
        const matches = await searchTickets({});

        if (!matches || matches.length === 0) {
            container.innerHTML = `<div class="text-center py-4 text-gray-500">No upcoming matches found.</div>`;
            return;
        }

        container.innerHTML = '';

        // Render each match/ticket card
        matches.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-5 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition-shadow';
            
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-600 uppercase">${item.sport_type}</span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded ${getStatusBadgeClass(item.remaining_capacity > 0 ? 'approved' : 'closed')}">
                            ${item.remaining_capacity > 0 ? 'Available' : 'Sold Out'}
                        </span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${item.home_team} vs ${item.away_team}</h3>
                    <p class="text-sm text-gray-600 mb-1"><i class="fas fa-map-marker-alt mr-1"></i> ${item.venue_name}, ${item.city_name}</p>
                    <p class="text-sm text-gray-500 mb-4"><i class="far fa-calendar-alt mr-1"></i> ${formatDate(item.match_date)}</p>
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                    <div>
                        <span class="text-xs text-gray-400 block">Price</span>
                        <span class="text-base font-bold text-gray-900">${formatCurrency(item.price)}</span>
                    </div>
                    <a href="./ticket-detail.html?id=${item.ticket_id}" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                        View Details
                    </a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading upcoming matches:', error);
        container.innerHTML = `<div class="text-center py-4 text-red-500">Failed to load matches. Please try again later.</div>`;
    }
}

/**
 * Optional: Populates city filter dropdown if present on the home page
 */
async function initCityFilterDropdown() {
    const citySelect = document.getElementById('city-filter-select');
    if (!citySelect) return;

    try {
        const cities = await getCities();
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.city_id;
            option.textContent = `${city.name} (${city.province})`;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load cities for filter:', error);
    }
}