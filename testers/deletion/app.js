// --- CONFIGURATION ---
const API_URL = 'https://testers-api.makesensedeveloper.workers.dev/';

document.addEventListener('DOMContentLoaded', () => {
    setupForm();
});

function setupForm() {
    const form = document.getElementById('deletionForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();

        if (!email) return;

        if (!confirm('Are you absolutely sure you want to delete your testing data? This cannot be undone.')) {
            return;
        }

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> DELETING...';
        messageDiv.style.display = 'none';

        try {
            const result = await apiCall('deleteAccount', { email });

            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${result.message}`;
                form.reset();
            } else {
                messageDiv.className = 'message error';
                messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.message}`;
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.innerHTML = '<i class="fas fa-wifi"></i> Connection error. Please try again.';
        } finally {
            messageDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-text">DELETE MY DATA</span> <i class="fas fa-trash-alt"></i>';
        }
    });
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
