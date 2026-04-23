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
   GOOGLE LOGIN
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
    console.log("Logout error:", error);
  }
};

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.currentUserId = user.uid;

    if (el("userEmail")) {
      el("userEmail").innerText = user.email;
    }

    socket.emit("register", user.uid);

    if (window.loadFeed) {
      window.loadFeed();
    }
  } else {
    window.currentUserId = null;

    if (el("userEmail")) {
      el("userEmail").innerText = "";
    }

    setTimeout(() => {
      window.googleLogin();
    }, 800);
  }
});

/* =========================
   TAB SWITCHER
========================= */
window.switchTab = (tabId) => {
  const sections = document.querySelectorAll(".tab-section");

  sections.forEach(section => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  const activeSection = el(tabId);

  if (activeSection) {
    activeSection.style.display = "block";
    activeSection.classList.add("active");
  }

  if (tabId === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tabId === "messages" && window.loadMessages) {
    window.loadMessages("demo-user");
  }
};

/* =========================
   BUTTON HANDLERS
========================= */
function bindButtons() {
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

  el("audioCallBtn")?.addEventListener("click", () => {
    window.startCall?.();
  });

  el("videoCallBtn")?.addEventListener("click", () => {
    window.startVideoCall?.();
  });

  el("cookieAcceptBtn")?.addEventListener("click", () => {
    window.acceptCookies?.();
  });
}

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  bindButtons();

  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1500);

  window.switchTab("feed");
});
