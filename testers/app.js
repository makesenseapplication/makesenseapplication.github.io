// --- CONFIGURATION ---
// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzCPi2ZOyYsUSWdMzdNfbirY4XCiNeeomXWgX0UYFxT32co7EWotwsrUJC3qK5ln7kOdw/exec';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadTesters();
    setupForm();
});

function setupForm() {
    const form = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();

        if (!name || !email) return;

        // 1. Specific Gmail Validation
        if (!email.endsWith('@gmail.com')) {
            messageDiv.className = 'message error';
            messageDiv.innerHTML = '<i class="fas fa-envelope"></i> Please use a valid <strong>@gmail.com</strong> address.';
            messageDiv.style.display = 'block';
            return;
        }

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SIGNING UP...';
        messageDiv.style.display = 'none';

        try {
            const result = await apiCall('signup', { name, email });

            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${result.message}`;
                form.reset();
                loadTesters(); // Refresh the list
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
            submitBtn.innerHTML = '<span class="btn-text">SIGN UP AS TESTER</span> <i class="fas fa-arrow-right"></i>';
        }
    });
}

async function loadTesters() {
    const listElement = document.getElementById('testersList');
    const loadingElement = document.getElementById('loading');

    try {
        const result = await apiCall('getTesters');

        if (result.success && result.data.length > 0) {
            loadingElement.style.display = 'none';
            listElement.innerHTML = result.data.map(tester => `
                <div class="tester-item">
                    <div class="tester-avatar">${tester.name[0]}</div>
                    <div class="tester-info">
                        <div class="tester-name">${tester.name}</div>
                        <div class="tester-email">${tester.email}</div>
                    </div>
                </div>
            `).join('');
        } else {
            loadingElement.innerHTML = '<i class="fas fa-users"></i> <span>Be the first tester to join!</span>';
        }
    } catch (error) {
        console.error('Failed to load testers:', error);
        loadingElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Failed to load tester list.</span>';
    }
}

// --- JSONP API HELPER ---
// Using JSONP to avoid CORS issues with Google Apps Script
function apiCall(action, data = {}) {
    return new Promise((resolve) => {
        const uniqueId = 'api-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8);
        const scriptId = 'script-' + uniqueId;
        const callbackName = 'jsonp_' + uniqueId.replace(/-/g, '_');

        const params = new URLSearchParams();
        params.append('action', action);
        params.append('callback', callbackName);
        for (const key in data) {
            params.append(key, data[key]);
        }

        const cleanup = () => {
            if (window[callbackName]) delete window[callbackName];
            const scriptEl = document.getElementById(scriptId);
            if (scriptEl) {
                try {
                    scriptEl.remove();
                } catch (e) {
                    if (scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
                }
            }
        };

        window[callbackName] = (response) => {
            cleanup();
            resolve(response);
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `${API_URL}?${params.toString()}`;

        script.onerror = () => {
            cleanup();
            resolve({ success: false, message: 'Network error' });
        };

        document.body.appendChild(script);

        // Timeout after 20 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                cleanup();
                resolve({ success: false, message: 'Request timeout' });
            }
        }, 20000);
    });
}
