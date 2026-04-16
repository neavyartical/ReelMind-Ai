const API = "https://reelmindbackend-1.onrender.com";
const ADMIN_EMAIL = "neavyartical@gmail.com";

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
  apiKey: "AIzaSyCz9rReG2zuaj0AGuafpTzpCUopuHMD_wQ",
  authDomain: "reelmind-ai-f07cb.firebaseapp.com",
  projectId: "reelmind-ai-f07cb",
  storageBucket: "reelmind-ai-f07cb.firebasestorage.app",
  messagingSenderId: "731354245603",
  appId: "1:731354245603:web:1db1952458a8473082d8d6",
  measurementId: "G-F23DP2G9MW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let userToken = null;
let creditTimer = null;

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

function setUserInfo(email, credits, location = "Unknown") {
  const admin = email === ADMIN_EMAIL;

  if (el("userEmail")) el("userEmail").innerText = email;
  if (el("credits")) el("credits").innerText = admin ? "∞" : credits;
  if (el("userLocation")) el("userLocation").innerText = location;
}

/* =========================
   PAYMENT
========================= */
window.buyCredits = function () {
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

window.buyPlan = function (plan) {
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

/* =========================
   SAVE LOCATION
========================= */
async function detectAndSaveLocation() {
  if (!userToken) return;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    await fetch(`${API}/save-location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        city: data.city || "Unknown",
        country: data.country_name || "Unknown"
      })
    });
  } catch {}
}

/* =========================
   PROFILE
========================= */
async function loadUserProfile() {
  if (!userToken) return;

  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    const data = await res.json();

    setUserInfo(
      data.email || "Guest",
      data.credits ?? 0,
      `${data.city || "Unknown"}, ${data.country || "Unknown"}`
    );
  } catch {
    setUserInfo("Guest", 0, "Unknown");
  }
}

/* =========================
   TRANSACTIONS
========================= */
async function loadTransactions() {
  if (!userToken || !el("transactionList")) return;

  try {
    const res = await fetch(`${API}/transactions`, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    const data = await res.json();

    if (!Array.isArray(data)) {
      el("transactionList").innerHTML = `<div class="card">No history available</div>`;
      return;
    }

    el("transactionList").innerHTML = data.map(item => `
      <div class="card">
        <strong>${item.type}</strong><br>
        Credits: ${item.amount}<br>
        <small>${new Date(item.date).toLocaleString()}</small>
      </div>
    `).join("");
  } catch {
    el("transactionList").innerHTML = `<div class="card">Unable to load history</div>`;
  }
}

/* =========================
   REFRESH CREDITS
========================= */
function startCreditRefresh() {
  if (creditTimer) clearInterval(creditTimer);

  creditTimer = setInterval(() => {
    if (userToken) loadUserProfile();
  }, 20000);
}

/* =========================
   AUTH
========================= */
window.emailRegister = async function () {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    showMessage("Account created successfully");
  } catch (err) {
    showMessage(err.message);
  }
};

window.emailLogin = async function () {
  try {
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
  } catch (err) {
    showMessage(err.message);
  }
};

window.googleLogin = async function () {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    showMessage(err.message);
  }
};

window.logout = async function () {
  await signOut(auth);
};

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userToken = await user.getIdToken();

    await detectAndSaveLocation();
    await loadUserProfile();
    await loadTransactions();

    startCreditRefresh();
  } else {
    userToken = null;
    setUserInfo("Guest Mode", "∞");
  }
});

/* =========================
   TABS
========================= */
window.switchTab = function (tab) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");

  if (tab === "settings") {
    loadTransactions();
  }
};

/* =========================
   LOADING
========================= */
function showLoading() {
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `;
}

/* =========================
   DOWNLOAD BUTTON
========================= */
function addDownloadButton(url) {
  return `
    <button class="action" onclick="window.open('${url}','_blank')">
      Download
    </button>
  `;
}

/* =========================
   TYPEWRITER
========================= */
function typeWriter(text) {
  el("result").innerHTML = `<div class="card" id="typedText"></div>`;
  let i = 0;

  function write() {
    if (i < text.length) {
      el("typedText").innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 4);
    }
  }

  write();
}

/* =========================
   GENERATE
========================= */
window.generateContent = async function () {
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const location = val("location");

  if (!prompt) return showMessage("Please enter a prompt");

  showLoading();

  try {
    const headers = {
      "Content-Type": "application/json"
    };

    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    const res = await fetch(`${API}/generate-${mode}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        language,
        location
      })
    });

    const data = await res.json();

    if (data.error) {
      el("result").innerHTML = `<div class="card">${data.error}</div>`;
      return;
    }

    if (mode === "text") {
      typeWriter(data?.data?.content || "No content");
    }

    if (mode === "image") {
      const url = data?.data?.url;
      el("result").innerHTML = `
        <div class="card">
          <img src="${url}" alt="Generated image">
          ${addDownloadButton(url)}
        </div>
      `;
    }

    if (mode === "video") {
      const url = data.preview || data.video || data?.data?.url;
      el("result").innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${url}"></video>
          ${addDownloadButton(url)}
        </div>
      `;
    }

    loadUserProfile();
    loadTransactions();

  } catch {
    el("result").innerHTML = `<div class="card">Generation failed</div>`;
  }
};

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return showMessage("Voice not supported on this device");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    el("prompt").value += " " + event.results[0][0].transcript;
  };

  recognition.start();
};

/* =========================
   UPLOAD IMAGE
========================= */
window.handleUpload = function (input) {
  const file = input.files[0];
  if (!file) return;

  showMessage("Upload ready: " + file.name);
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function () {
  localStorage.setItem("cookieAccepted", "yes");
  if (el("cookieBanner")) {
    el("cookieBanner").style.display = "none";
  }
};

/* =========================
   ON LOAD
========================= */
window.addEventListener("load", () => {
  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) {
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
      }, 700);
    }
  }, 3000);
});
