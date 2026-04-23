export const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   FIREBASE
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   SOCKET
========================= */
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

/* =========================
   MODULES
========================= */
import { loadFeed } from "./feed.js";
import "./chat.js";
import "./settings.js";
import "./ai.js";

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const socket = io(API);

window.socket = socket;

/* =========================
   HELPERS
========================= */
export function el(id) {
  return document.getElementById(id);
}

/* =========================
   AUTH
========================= */
window.googleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.log("Login error:", error);
  }
};

window.logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.log(error);
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.currentUserId = user.uid;

    if (el("userEmail")) {
      el("userEmail").innerText = user.email || "";
    }

    socket.emit("register", user.uid);

    if (window.loadFeed) {
      window.loadFeed();
    }
  }
});

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = function(tabId) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  const target = el(tabId);

  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  if (tabId === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tabId === "messages" && window.loadMessages) {
    window.loadMessages("demo-user");
  }
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function() {
  localStorage.setItem("cookieAccepted", "yes");

  const banner = el("cookieBanner");
  if (banner) {
    banner.style.display = "none";
  }
};

/* =========================
   PLACEHOLDER BUTTONS
========================= */
window.startCall = function() {
  alert("Audio calling coming soon");
};

window.startVideoCall = function() {
  alert("Video calling coming soon");
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) splash.remove();
  }, 1500);

  if (localStorage.getItem("cookieAccepted") === "yes") {
    const banner = el("cookieBanner");
    if (banner) banner.style.display = "none";
  }

  window.switchTab("feed");

  el("generateBtn")?.addEventListener("click", () => {
    window.generateContent?.();
  });

  el("sendBtn")?.addEventListener("click", () => {
    window.sendMessage?.();
  });

  el("voiceBtn")?.addEventListener("click", () => {
    window.startVoiceInput?.();
  });

  el("downloadBtn")?.addEventListener("click", () => {
    window.downloadResult?.();
  });

  el("cookieAcceptBtn")?.addEventListener("click", () => {
    window.acceptCookies();
  });

  el("audioCallBtn")?.addEventListener("click", () => {
    window.startCall();
  });

  el("videoCallBtn")?.addEventListener("click", () => {
    window.startVideoCall();
  });

  el("uploadBtn")?.addEventListener("click", () => {
    window.switchTab("create");
  });
});
