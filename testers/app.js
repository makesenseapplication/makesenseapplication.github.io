// --- CONFIGURATION ---
const API_URL = 'https://testers-api.makesensedeveloper.workers.dev/';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadTesters();
});

let allTesters = [];
let visibleCount = 10;

async function loadTesters() {
    const loadingElement = document.getElementById('loading');
    const showMoreContainer = document.getElementById('showMoreContainer');
    const showMoreBtn = document.getElementById('showMoreBtn');

    try {
        const result = await apiCall('getTesters');

        if (result.success && result.data.length > 0) {
            allTesters = result.data;
            if (loadingElement) loadingElement.style.display = 'none';

            renderTesters();

            if (showMoreBtn) {
                showMoreBtn.onclick = () => {
                    visibleCount += 10;
                    renderTesters();
                };
            }
        } else {
            if (loadingElement) loadingElement.innerHTML = '<i class="fas fa-users"></i> <span>Be the first tester to join!</span>';
            if (showMoreContainer) showMoreContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load testers:', error);
        if (loadingElement) loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Failed to load tester list.</span>';
        if (showMoreContainer) showMoreContainer.style.display = 'none';
    }
}

function renderTesters() {
    const listElement = document.getElementById('testersList');
    const showMoreContainer = document.getElementById('showMoreContainer');

    const visibleTesters = allTesters.slice(0, visibleCount);

    if (listElement) {
        listElement.innerHTML = visibleTesters.map(tester => `
            <div class="tester-item">
                <div class="tester-avatar">${tester.name[0]}</div>
                <div class="tester-info">
                    <div class="tester-name">${tester.name}</div>
                    <div class="tester-email">${tester.email}</div>
                </div>
            </div>
        `).join('');
    }

    if (showMoreContainer) {
        if (visibleCount < allTesters.length) {
            showMoreContainer.style.display = 'block';
        } else {
            showMoreContainer.style.display = 'none';
        }
    }
}

// --- API HELPER ---
async function apiCall(action, data = {}) {
    const params = new URLSearchParams();
    params.append('action', action);
    params.append('_', Date.now());
    for (const key in data) {
        params.append(key, data[key]);
    }

    try {
        const url = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Call failed:', error);
        return { success: false, message: 'Connection error. Please try again.' };
    }
}
