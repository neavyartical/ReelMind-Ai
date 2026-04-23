const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   AI MODULE
========================= */
const AI = {
  latestUrl: "",
  generating: false
};

/* =========================
   HELPERS
========================= */
function el(id) {
  return document.getElementById(id);
}

function setLoading(message = "Generating...") {
  const result = el("result");
  if (!result) return;

  result.innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showText(text) {
  AI.latestUrl = "";
  el("result").innerHTML = `
    <div class="card">${text}</div>
  `;
}

function showImage(url) {
  AI.latestUrl = url;
  el("result").innerHTML = `
    <div class="card">
      <img src="${url}" alt="Generated image">
    </div>
  `;
}

function showVideo(url) {
  AI.latestUrl = url;
  el("result").innerHTML = `
    <div class="card">
      <video controls playsinline src="${url}"></video>
    </div>
  `;
}

/* =========================
   GENERATE CONTENT
========================= */
export async function generateAI() {
  if (AI.generating) return;

  const prompt = el("prompt")?.value?.trim();
  const mode = el("mode")?.value || "image";

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  AI.generating = true;
  setLoading();

  try {
    const response = await fetch(`${API}/api/ai/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Generation failed");
    }

    if (mode === "text") {
      showText(data.data.content);
    }

    if (mode === "image") {
      showImage(data.data.url);
    }

    if (mode === "video") {
      showVideo(data.data.preview);
    }
  } catch (error) {
    showText(error.message || "Generation failed");
  }

  AI.generating = false;
}

/* =========================
   EDIT IMAGE
========================= */
export async function editImage(promptText) {
  AI.generating = true;
  setLoading("Editing image...");

  try {
    const response = await fetch(`${API}/api/ai/edit-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: promptText || "Enhance image"
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("Image editing failed");
    }

    showImage(data.data.url);
  } catch (error) {
    showText(error.message);
  }

  AI.generating = false;
}

/* =========================
   DOWNLOAD
========================= */
export function downloadAIResult() {
  if (!AI.latestUrl) return;

  const a = document.createElement("a");
  a.href = AI.latestUrl;
  a.download = "reelmind-result";
  a.click();
}
