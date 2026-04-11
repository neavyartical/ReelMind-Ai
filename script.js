// ===============================
// 🔑 CONFIG
// ===============================
const OPENROUTER_API_KEY = "YOUR_OPENROUTER_KEY_HERE";

// ===============================
// 🚀 MAIN GENERATE FUNCTION
// ===============================
function handleGenerate() {
    const prompt = document.getElementById("prompt").value.trim();
    const output = document.getElementById("output");

    if (!prompt) {
        alert("Please enter something first!");
        return;
    }

    output.innerHTML = "⏳ Generating...";

    const lowerPrompt = prompt.toLowerCase();

    // Smart detection
    if (
        lowerPrompt.includes("image") ||
        lowerPrompt.includes("picture") ||
        lowerPrompt.includes("photo") ||
        lowerPrompt.includes("draw")
    ) {
        generateImage(prompt);
    } 
    else if (
        lowerPrompt.includes("video") ||
        lowerPrompt.includes("clip") ||
        lowerPrompt.includes("movie")
    ) {
        generateVideo(prompt);
    } 
    else {
        generateText(prompt);
    }
}

// ===============================
// 🖼️ IMAGE GENERATION (Pollinations)
// ===============================
function generateImage(prompt) {
    const output = document.getElementById("output");

    try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        output.innerHTML = `
            <img src="${imageUrl}" 
                 style="max-width:90%; border-radius:15px; box-shadow:0 0 20px cyan;">
            <br><br>
            <button onclick="downloadImage('${imageUrl}')">⬇ Download Image</button>
        `;
    } catch (err) {
        output.innerHTML = "❌ Image generation failed.";
    }
}

// ===============================
// ⬇ DOWNLOAD IMAGE
// ===============================
function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "reelmind-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ===============================
// 🧠 TEXT / STORIES (OpenRouter)
// ===============================
async function generateText(prompt) {
    const output = document.getElementById("output");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + OPENROUTER_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();

        if (!data || !data.choices || !data.choices[0]) {
            output.innerHTML = "❌ API error. Check your key or quota.";
            return;
        }

        output.innerHTML = `
            <div style="max-width:90%; margin:auto; text-align:left;">
                ${data.choices[0].message.content}
            </div>
        `;

    } catch (error) {
        output.innerHTML = "❌ Failed to generate text.";
    }
}

// ===============================
// 🎬 VIDEO (SMART FALLBACK)
// ===============================
function generateVideo(prompt) {
    const output = document.getElementById("output");

    output.innerHTML = `
        <p style="color:orange;">
        ⚠️ Real video generation requires a paid API (Replicate / Runway / Pika).
        </p>
        <p>🎬 Generating video concept instead...</p>
    `;

    generateText("Create a cinematic short video script for: " + prompt);
}
