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

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
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

function showMessage(message) {
  alert(message);
}

function setUserInfo(email, credits, location = "Unknown") {
  const isAdmin = email === ADMIN_EMAIL;

  if (el("userEmail")) el("userEmail").innerText = email;
  if (el("credits")) el("credits").innerText = isAdmin ? "∞" : credits;
  if (el("userLocation")) el("userLocation").innerText = location;
}

/* =========================
   PAYMENT
========================= */
window.buyCredits = function () {
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

window.buyPlan = function (plan) {
  const plans = {
    starter: "https://ko-fi.com/articalneavy",
    pro: "https://ko-fi.com/articalneavy",
    unlimited: "https://ko-fi.com/articalneavy"
  };

  window.open(plans[plan], "_blank");
};

/* =========================
   LOCATION
========================= */
async function detectAndSaveLocation() {
  if (!userToken) return;

  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    await fetch(`${API}/save-location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        country: data.country_name || "Unknown",
        city: data.city || "Unknown"
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
    const location = `${data.city || "Unknown"}, ${data.country || "Unknown"}`;

    setUserInfo(data.email || "Guest", data.credits ?? 0, location);
  } catch {
    setUserInfo("Guest", 0, "Unknown");
  }
}

/* =========================
   CREDIT REFRESH
========================= */
function startCreditRefresh() {
  if (creditTimer) clearInterval(creditTimer);

  creditTimer = setInterval(() => {
    if (userToken) loadUserProfile();
  }, 20000);
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
      el("transactionList").innerHTML = `<div class="card">No history yet</div>`;
      return;
    }

    el("transactionList").innerHTML = data.map(item => `
      <div class="card">
        <strong>${item.type || "Activity"}</strong><br>
        Credits: ${item.amount || 0}<br>
        <small>${new Date(item.date).toLocaleString()}</small>
      </div>
    `).join("");
  } catch {
    el("transactionList").innerHTML = `<div class="card">Unable to load history</div>`;
  }
}

/* =========================
   AUTH
========================= */
window.emailRegister = async () => {
  const email = val("email");
  const password = val("password");

  if (!email || !password) {
    return showMessage("Please enter email and password");
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
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
    setUserInfo("Guest Mode", "∞", "Unknown");

    if (creditTimer) clearInterval(creditTimer);
    if (el("transactionList")) el("transactionList").innerHTML = "";
  }
});

/* =========================
   REFRESH AFTER PAYMENT
========================= */
window.addEventListener("focus", () => {
  if (userToken) {
    loadUserProfile();
    loadTransactions();
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
   TYPEWRITER
========================= */
function typeWriter(text) {
  el("result").innerHTML = `<div class="card" id="typedText"></div>`;
  let i = 0;
  const target = el("typedText");

  function write() {
    if (i < text.length) {
      target.innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 4);
    }
  }

  write();
}

/* =========================
   VIDEO WAIT
========================= */
async function waitForVideo(taskId) {
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 4000));

    const res = await fetch(`${API}/video-status/${taskId}`);
    const data = await res.json();

    if (data.video) {
      el("result").innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${data.video}"></video>
        </div>
      `;

      loadUserProfile();
      loadTransactions();
      return;
    }
  }

  el("result").innerHTML = `<div class="card">Video still processing...</div>`;
}

/* =========================
   GENERATE
========================= */
window.generateContent = async () => {
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const location = val("location");

  if (!prompt) return showMessage("Enter a prompt");

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
      typeWriter(data?.data?.content || "No response");
    }

    if (mode === "image") {
      el("result").innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if (mode === "video") {
      if (data.preview) {
        el("result").innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${data.preview}"></video>
          </div>
        `;
      } else if (data.taskId) {
        waitForVideo(data.taskId);
      }
    }

    loadUserProfile();
    loadTransactions();
  } catch {
    el("result").innerHTML = `<div class="card">Generation failed</div>`;
  }
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function () {
  localStorage.setItem("cookieAccepted", "yes");
  if (el("cookieBanner")) el("cookieBanner").style.display = "none";
};

/* =========================
   LOAD
========================= */
window.addEventListener("load", () => {
  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) el("cookieBanner").style.display = "none";
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
