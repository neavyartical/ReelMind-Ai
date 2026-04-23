/* =========================
   MAIN APP
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
   CONFIG
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

export let currentUserId = null;

/* =========================
   HELPERS
========================= */
export function el(id) {
  return document.getElementById(id);
}

/* =========================
   LOGIN
========================= */
window.googleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.log(error);
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
    currentUserId = user.uid;
    window.currentUserId = user.uid;

    if (el("userEmail")) {
      el("userEmail").innerText = user.email;
    }

    socket.emit("register", user.uid);

    loadFeed();
  } else {
    currentUserId = null;
    window.currentUserId = null;

    if (el("userEmail")) {
      el("userEmail").innerText = "";
    }

    setTimeout(() => {
      googleLogin();
    }, 1000);
  }
});

/* =========================
   TABS
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  const target = el(tab);
  if (target) {
    target.classList.add("active");
  }

  if (tab === "feed") {
    loadFeed();
  }
};

/* =========================
   BUTTON EVENTS
========================= */
window.addEventListener("load", () => {
  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1500);

  el("generateBtn")?.addEventListener("click", () => {
    if (window.generateContent) {
      window.generateContent();
    }
  });

  el("sendBtn")?.addEventListener("click", () => {
    if (window.sendMessage) {
      window.sendMessage();
    }
  });

  el("voiceBtn")?.addEventListener("click", () => {
    if (window.startVoiceInput) {
      window.startVoiceInput();
    }
  });

  el("downloadBtn")?.addEventListener("click", () => {
    if (window.downloadResult) {
      window.downloadResult();
    }
  });

  el("cookieAcceptBtn")?.addEventListener("click", () => {
    if (window.acceptCookies) {
      window.acceptCookies();
    }
  });

  el("audioCallBtn")?.addEventListener("click", () => {
    if (window.startCall) {
      window.startCall();
    }
  });

  el("videoCallBtn")?.addEventListener("click", () => {
    if (window.startVideoCall) {
      window.startVideoCall();
    }
  });

  loadFeed();
});
