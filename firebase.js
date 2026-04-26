// firebase.js
import { API } from "./script.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCz9rReG2zuaj0AGuafpTzpCUopuHMD_wQ",
  authDomain: "reelmind-ai-f07cb.firebaseapp.com",
  projectId: "reelmind-ai-f07cb",
  storageBucket: "reelmind-ai-f07cb.appspot.com",
  messagingSenderId: "731354245603",
  appId: "1:731354245603:web:1db1952458a8473082d8d6",
  measurementId: "G-F23DP2G9MW"
};

/* =========================
   SAFE INIT
========================= */
let app = null;
let auth = null;
let provider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();

  console.log("Firebase initialized");
} catch (error) {
  console.log("Firebase init failed:", error);
}

export { auth };

/* =========================
   SAFE BACKEND SYNC
========================= */
async function syncUserToBackend(user) {
  if (!user || !auth) return;

  try {
    const token = await user.getIdToken();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    await fetch(`${API}/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        photoURL: user.photoURL || ""
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
  } catch (error) {
    console.log("Backend sync failed:", error.message);
  }
}

/* =========================
   SAFE UI UPDATE
========================= */
function updateUserUI(user) {
  try {
    const userEmail = document.getElementById("userEmail");
    const avatar = document.getElementById("profileAvatar");
    const nameInput = document.getElementById("profileNameInput");

    if (userEmail) {
      userEmail.innerText = user?.email || "Guest";
    }

    if (avatar && user?.photoURL) {
      avatar.src = user.photoURL;
    }

    if (nameInput && user?.displayName) {
      nameInput.value = user.displayName;
    }
  } catch (error) {
    console.log("UI update failed:", error);
  }
}

/* =========================
   SIGNUP
========================= */
export async function signup(email, password, name = "") {
  if (!auth) throw new Error("Firebase unavailable");

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (name) {
    await updateProfile(result.user, {
      displayName: name
    });
  }

  await syncUserToBackend(result.user);

  return result;
}

/* =========================
   LOGIN
========================= */
export async function login(email, password) {
  if (!auth) throw new Error("Firebase unavailable");

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  await syncUserToBackend(result.user);

  return result;
}

/* =========================
   GOOGLE LOGIN
========================= */
export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase unavailable");

  const result = await signInWithPopup(auth, provider);

  await syncUserToBackend(result.user);

  return result;
}

/* =========================
   LOGOUT
========================= */
export async function logout() {
  if (!auth) return;
  await signOut(auth);
}

/* =========================
   WATCH USER
========================= */
export function watchUser(callback) {
  if (!auth) {
    callback?.(null);
    return;
  }

  onAuthStateChanged(auth, async user => {
    updateUserUI(user);

    if (user) {
      await syncUserToBackend(user);
    }

    if (callback) {
      callback(user);
    }
  });
}
