const BASE_URL = "https://reelmindbackend-1.onrender.com";

/* MAIN */
function handleGenerate() {
    const prompt = document.getElementById("prompt").value.trim();
    const output = document.getElementById("output");

    if (!prompt) {
        alert("Enter something!");
        return;
    }

    output.innerHTML = "⏳ Generating...";

    const lower = prompt.toLowerCase();

    if (lower.includes("image")) {
        generateImage(prompt);
    } 
    else if (lower.includes("video")) {
        generateVideo(prompt);
    } 
    else {
        generateText(prompt);
    }
}

/* IMAGE */
function generateImage(prompt) {
    const output = document.getElementById("output");

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    output.innerHTML = `
        <img src="${url}" style="max-width:90%; border-radius:15px;">
        <br><br>
        <button onclick="downloadImage('${url}')">Download Image</button>
    `;
}

function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
}

/* TEXT */
async function generateText(prompt) {
    const output = document.getElementById("output");

    try {
        const res = await fetch(`${BASE_URL}/generate-text`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        output.innerHTML = `
            <div style="text-align:left; max-width:90%; margin:auto;">
                ${data.choices?.[0]?.message?.content || "No response"}
            </div>
        `;

    } catch {
        output.innerHTML = "❌ Text failed";
    }
}

/* VIDEO (AUTO LOAD) */
async function generateVideo(prompt) {
    const output = document.getElementById("output");

    output.innerHTML = "🎬 Creating video...";

    try {
        const res = await fetch(`${BASE_URL}/generate-video`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        const jobId = data.id || data.job_id;

        if (!jobId) {
            output.innerHTML = "⚠️ Failed to start video.";
            return;
        }

        output.innerHTML = "⏳ Processing video...";

        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            const check = await fetch(`${BASE_URL}/video-status/${jobId}`);
            const result = await check.json();

            if (result.video_url) {
                clearInterval(interval);

                output.innerHTML = `
                    <video controls width="300">
                        <source src="${result.video_url}">
                    </video>
                `;
            }

            if (attempts > 10) {
                clearInterval(interval);
                output.innerHTML = "⚠️ Still processing... try again.";
            }

        }, 3000);

    } catch {
        output.innerHTML = "❌ Video failed";
    }
}
