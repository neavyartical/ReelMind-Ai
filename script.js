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
   MODULES
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
   LOAD PROFILE
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
  } catch (error) {
    console.log("Profile load error:", error);
  }
}

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userToken = await user.getIdToken();

    socket.emit("register", user.uid);

    if (el("userEmail")) {
      el("userEmail").innerText = user.email;
    }

    await loadProfile();
  } else {
    userToken = null;
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
  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1800);
});
