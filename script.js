async function generate() {
  const prompt = document.getElementById("prompt").value;
  const output = document.getElementById("output");
  const downloadBtn = document.getElementById("downloadBtn");

  output.innerHTML = "⏳ Generating...";
  downloadBtn.style.display = "none";

  if (!prompt) {
    output.innerHTML = "❌ Enter something";
    return;
  }

  const lower = prompt.toLowerCase();

  // 🧠 DETECT MODE
  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture")) {
    generateImage(prompt);
  } else if (lower.includes("video")) {
    generateVideo(prompt);
  } else {
    generateText(prompt);
  }
}

// 🎨 IMAGE GENERATION (REAL FIX)
function generateImage(prompt) {
  const output = document.getElementById("output");
  const downloadBtn = document.getElementById("downloadBtn");

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

  output.innerHTML = `<img src="${url}" id="genImg">`;

  // DOWNLOAD FIX
  downloadBtn.href = url;
  downloadBtn.style.display = "inline-block";
  downloadBtn.innerText = "⬇ Download Image";
}

// 🎬 VIDEO (SMART SYSTEM)
function generateVideo(prompt) {
  const output = document.getElementById("output");

  output.innerHTML = `
  🎬 <b>Video Generation (Pro Feature)</b><br><br>
  We are preparing your cinematic AI video...<br><br>
  🔒 Unlock full video generation in ReelMind Pro 🚀
  `;
}

// 🧠 TEXT GENERATION (BACKEND)
async function generateText(prompt) {
  const output = document.getElementById("output");

  try {
    const res = await fetch("https://reelmindbackend-1.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    output.innerText = data.result;

  } catch {
    output.innerText = "❌ Server error";
  }
}
