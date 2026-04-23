/* =========================
   MAIN APP CONFIG
========================= */
export const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   FIREBASE
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
   SOCKET
========================= */
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

/* =========================
   LOAD MODULES
========================= */
import "./ai.js";
import "./feed.js";
import "./chat.js";
import "./settings.js";

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

/* =========================
   INITIALIZE
========================= */
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();
export const socket = io(API);

/* =========================
   GLOBALS
========================= */
export let userToken = null;
export let selectedUser = "demo-user";

/* =========================
   HELPERS
========================= */
export function el(id) {
  return document.getElementById(id);
}

export function val(id) {
  return el(id)?.value?.trim() || "";
}

/* =========================
   AUTH FUNCTIONS
========================= */
window.googleLogin = async () => {
  await signInWithPopup(auth, provider);
};

window.emailRegister = async () => {
  await createUserWithEmailAndPassword(
    auth,
    val("email"),
    val("password")
  );
};

window.emailLogin = async () => {
  await signInWithEmailAndPassword(
    auth,
    val("email"),
    val("password")
  );
};

window.logout = async () => {
  await signOut(auth);
};

/* =========================
   PROFILE
========================= */
export async function loadProfile() {
  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: userToken
          ? `Bearer ${userToken}`
          : ""
      }
    });

    const data = await res.json();

    if (el("credits")) {
      el("credits").innerText = data.credits || 0;
    }

    if (el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }

    if (el("profileName")) {
      el("profileName").innerText =
        data.email || "Your Profile";
    }

    if (el("userEmail")) {
      el("userEmail").innerText =
        data.email || "Guest Mode";
    }

  } catch (error) {
    console.log("Profile error:", error);
  }
}

/* =========================
   SOCKET BASIC EVENTS
========================= */
socket.on("online-users", () => {
  if (el("onlineStatus")) {
    el("onlineStatus").innerText = "Online";
  }
});

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userToken = await user.getIdToken();

    socket.emit("register", user.uid);

    await loadProfile();
  } else {
    userToken = null;

    if (el("userEmail")) {
      el("userEmail").innerText = "Guest Mode";
    }
  }
});

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");

  if (tab === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tab === "messages" && window.loadMessages) {
    window.loadMessages();
  }

  if (tab === "settings" && window.loadSettings) {
    window.loadSettings();
  }
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
   PLACEHOLDER UTILITIES
========================= */
window.buyCredits = () => {
  alert("Payment integration coming soon");
};

window.uploadMedia = () => {
  alert("Upload feature coming soon");
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  if (window.loadFeed) {
    window.loadFeed();
  }

  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1800);
});
