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

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
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
    console.log("Logout error:", error);
  }
};

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    window.currentUserId = user.uid;

    if (el("userEmail")) {
      el("userEmail").innerText = user.email || "";
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
      window.googleLogin();
    }, 800);
  }
});

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  const current = el(tab);

  if (current) {
    current.style.display = "block";
    current.classList.add("active");
  }

  if (tab === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tab === "messages" && window.loadMessages) {
    window.loadMessages("demo-user");
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
   BUTTON EVENTS
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

  el("cookieAcceptBtn")?.addEventListener("click", () => {
    window.acceptCookies?.();
  });

  el("audioCallBtn")?.addEventListener("click", () => {
    window.startCall?.();
  });

  el("videoCallBtn")?.addEventListener("click", () => {
    window.startVideoCall?.();
  });

  el("uploadBtn")?.addEventListener("click", () => {
    window.uploadMedia?.();
  });
}

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  bindButtons();

  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(() => {
    if (el("welcomeCard")) {
      el("welcomeCard").style.opacity = "0";

      setTimeout(() => {
        el("welcomeCard")?.remove();
      }, 700);
    }
  }, 1500);

  window.switchTab("feed");
});
