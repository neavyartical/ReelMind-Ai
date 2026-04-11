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

/* ================= IMAGE ================= */
function generateImage(prompt) {
    const output = document.getElementById("output");

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    output.innerHTML = `
        <img src="${url}" style="max-width:90%; border-radius:15px;">
        <br><br>
        <button onclick="downloadImage('${url}')">Download Image</button>
    `;
}

/* DOWNLOAD */
function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.png";
    a.click();
}

/* ================= TEXT ================= */
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

/* ================= VIDEO ================= */
async function generateVideo(prompt) {
    const output = document.getElementById("output");

    output.innerHTML = "🎬 Generating video... please wait...";

    try {
        const res = await fetch(`${BASE_URL}/generate-video`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        if (data.video_url) {
            output.innerHTML = `
                <video controls width="300">
                    <source src="${data.video_url}">
                </video>
            `;
        } else {
            output.innerHTML = "⏳ Video processing... try again.";
        }

    } catch {
        output.innerHTML = "❌ Video failed";
    }
}
