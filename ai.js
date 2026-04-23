import { API, el } from "./script.js";

/* =========================
   AI STATE
========================= */
const AI = {
  latestUrl: "",
  generating: false
};

/* =========================
   UI HELPERS
========================= */
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

function showError(message) {
  const result = el("result");
  if (!result) return;

  result.innerHTML = `
    <div class="card">
      <p>${message}</p>
    </div>
  `;
}

function renderResult(mode, data) {
  const result = el("result");
  if (!result) return;

  if (mode === "text") {
    AI.latestUrl = "";
    result.innerHTML = `
      <div class="card">
        <p>${data.content || "No text returned"}</p>
      </div>
    `;
    return;
  }

  if (mode === "image") {
    AI.latestUrl = data.url || "";
    result.innerHTML = `
      <div class="card">
        <img src="${data.url}" alt="Generated image">
      </div>
    `;
    return;
  }

  if (mode === "video") {
    const videoUrl = data.url || data.preview || "";
    AI.latestUrl = videoUrl;

    result.innerHTML = `
      <div class="card">
        <video controls playsinline src="${videoUrl}"></video>
      </div>
    `;
  }
}

/* =========================
   GENERATE
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

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Generation failed");
    }

    renderResult(mode, data.data || {});
  } catch (error) {
    showError(error.message || "Generation failed");
  }

  AI.generating = false;
}

/* =========================
   DOWNLOAD
========================= */
export function downloadAIResult() {
  if (!AI.latestUrl) {
    alert("Nothing to download");
    return;
  }

  const link = document.createElement("a");
  link.href = AI.latestUrl;
  link.download = "reelmind-result";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================
   VOICE INPUT
========================= */
export function startVoiceInput() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    if (el("prompt")) {
      el("prompt").value = text;
    }
  };

  recognition.start();
}

/* =========================
   GLOBALS
========================= */
window.generateContent = generateAI;
window.downloadResult = downloadAIResult;
window.startVoiceInput = startVoiceInput;
