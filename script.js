const API_BASE = "https://reelmindbackend-1.onrender.com";

// --- UI Elements ---
const outputArea = document.getElementById('output-display');

/**
 * General function to call the AI Engine
 * @param {string} action - 'image', 'video', or 'chat'
 * @param {string} input - The user prompt
 */
async function triggerAI(action, input) {
    outputArea.innerHTML = `<p class="loading">ReelMind is processing your ${action}... please wait.</p>`;
    
    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, input })
        });

        const data = await response.json();

        if (data.type === 'image') {
            outputArea.innerHTML = `<h3>Generated Image</h3><img src="${data.url}" style="width:100%; border-radius:10px;" alt="AI Result">`;
        } else if (data.type === 'video') {
            outputArea.innerHTML = `<h3>Generated Video</h3><video controls style="width:100%"><source src="${data.url}" type="video/mp4"></video>`;
        } else if (data.type === 'chat') {
            outputArea.innerHTML = `<h3>AI Assistant</h3><p>${data.answer}</p>`;
        }
    } catch (error) {
        outputArea.innerHTML = `<p class="error">Error: Could not connect to ReelMind Engine.</p>`;
        console.error(error);
    }
}

// --- Load Stories on Startup ---
async function loadStories() {
    try {
        const res = await fetch(`${API_BASE}/story`);
        const stories = await res.json();
        console.log("Stories Loaded:", stories);
        // Add logic here to display stories in a sidebar if needed
    } catch (e) {
        console.log("Story fetch failed, server might be sleeping.");
    }
}

window.onload = loadStories;
