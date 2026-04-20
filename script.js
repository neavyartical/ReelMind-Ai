const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   FIREBASE IMPORT
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

/* =========================
   GLOBALS
========================= */
let userToken = null;
let latestDownloadUrl = "";
let uploadedFile = null;
let generating = false;

/* =========================
   HELPERS
========================= */
function el(id) {
  return document.getElementById(id);
}

function val(id) {
  return el(id)?.value?.trim() || "";
}

function showMessage(msg) {
  alert(msg);
}

/* =========================
   UI RENDERERS
========================= */
function setLoading(text = "Generating...") {
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      ${text}
    </div>
  `;
}

function renderText(text) {
  latestDownloadUrl = "";
  el("result").innerHTML = `<div class="card">${text || "No response"}</div>`;
}

function renderImage(url) {
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <img src="${latestDownloadUrl}" alt="Generated">
    </div>
  `;
}

function renderVideo(url) {
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <video controls playsinline src="${latestDownloadUrl}"></video>
    </div>
  `;
}

/* =========================
   PROFILE
========================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: userToken ? `Bearer ${userToken}` : ""
      }
    });

    const data = await res.json();

    if (el("credits")) el("credits").innerText = data.credits ?? 0;
    if (el("userLocation")) {
      el("userLocation").innerText = `${data.city || ""} ${data.country || ""}`.trim();
    }
    if (el("profileName")) {
      el("profileName").innerText = data.email || "Your Profile";
    }
  } catch {}
}

/* =========================
   FEED
========================= */
async function loadFeed() {
  if (!el("videoFeed")) return;

  el("videoFeed").innerHTML = `
    <div class="feed-card">
      <video controls playsinline src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
      <div class="feed-actions">
        <button onclick="showMessage('Liked')">❤️</button>
        <button onclick="switchTab('messages')">💬</button>
        <button onclick="showMessage('Shared')">📤</button>
      </div>
    </div>
  `;
}

/* =========================
   CHAT
========================= */
window.sendMessage = () => {
  const text = val("messageInput");
  if (!text || !el("messageList")) return;

  const msg = document.createElement("div");
  msg.className = "message sent";
  msg.innerText = text;

  el("messageList").appendChild(msg);
  el("messageInput").value = "";
};

/* =========================
   CALLS
========================= */
window.startCall = () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Audio call started...";
  }
};

window.startVideoCall = () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Video call started...";
  }
};

/* =========================
   PROMPT ENHANCER
========================= */
function enhancePrompt(prompt, mode) {
  let clean = String(prompt || "").trim();

  if (!clean) return "";

  if (mode === "image") {
    clean += "\nmasterpiece, ultra realistic, cinematic lighting, highly detailed";
  }

  if (mode === "video") {
    clean += "\ncinematic motion, smooth camera movement, professional quality";
  }

  if (mode === "text") {
    clean += "\nWrite professionally with immersive storytelling.";
  }

  return clean;
}

/* =========================
   AUTH
========================= */
window.emailRegister = async () => {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    showMessage("Account created");
  } catch (err) {
    showMessage(err.message);
  }
};

window.emailLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
  } catch (err) {
    showMessage(err.message);
  }
};

window.googleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    showMessage(err.message);
  }
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userToken = await user.getIdToken();
    if (el("userEmail")) el("userEmail").innerText = user.email;
    await loadProfile();
  } else {
    userToken = null;
    if (el("userEmail")) el("userEmail").innerText = "Guest Mode";
  }
});

/* =========================
   AI GENERATION
========================= */
window.generateContent = async () => {
  if (generating) return;

  let prompt = val("prompt");
  const mode = val("mode");

  if (!prompt) return showMessage("Enter prompt");

  generating = true;
  prompt = enhancePrompt(prompt, mode);

  setLoading();

  try {
    const res = await fetch(`${API}/generate-${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userToken ? `Bearer ${userToken}` : ""
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (mode === "text") renderText(data?.data?.content);
    if (mode === "image") renderImage(data?.data?.url || data?.url);
    if (mode === "video") renderVideo(data?.video || data?.preview);

  } catch {
    renderText("Generation failed");
  }

  generating = false;
};

/* =========================
   UPLOAD
========================= */
window.uploadMedia = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";
  input.click();
};

/* =========================
   VOICE
========================= */
window.startVoiceInput = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.onresult = (e) => {
    if (el("prompt")) {
      el("prompt").value = e.results[0][0].transcript;
    }
  };

  recognition.start();
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = () => {
  if (!latestDownloadUrl) return;

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  a.click();
};

/* =========================
   NAVIGATION
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = () => {
  localStorage.setItem("cookieAccepted", "yes");
  if (el("cookieBanner")) {
    el("cookieBanner").style.display = "none";
  }
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  loadFeed();

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) splash.style.display = "none";
  }, 1800);
});
