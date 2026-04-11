const API_URL = "https://reelmindbackend-1.onrender.com/story";

const loadStories = async () => {
    const display = document.getElementById('story-display');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        display.innerHTML = data.map(story => `
            <div class="card">
                <h3>${story.title}</h3>
                <p>${story.content}</p>
            </div>
        `).join('');
    } catch (error) {
        display.innerHTML = `<p class="error">Error loading stories. Please refresh in 30 seconds.</p>`;
        console.error("Fetch error:", error);
    }
};

window.addEventListener('DOMContentLoaded', loadStories);
