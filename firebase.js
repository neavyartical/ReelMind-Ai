// firebase.js
import { API, el } from "./script.js";

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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

/* =========================
   INIT
========================= */
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/* =========================
   BACKEND SYNC
========================= */
async function syncUserToBackend(user) {
  if (!user) return;

  try {
    const token = await user.getIdToken();

    await fetch(`${API}/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName || "",
        photo: user.photoURL || ""
      })
    });
  } catch (error) {
    console.log("Sync user failed:", error);
  }
}

/* =========================
   UPDATE UI
========================= */
function updateUserUI(user) {
  if (el("userEmail")) {
    el("userEmail").innerText =
      user?.email || "Guest";
  }

  if (user?.photoURL && el("profileAvatar")) {
    el("profileAvatar").src = user.photoURL;
  }

  if (user?.displayName && el("profileNameInput")) {
    el("profileNameInput").value = user.displayName;
  }
}

/* =========================
   SIGNUP
========================= */
export async function signup(email, password, name = "") {
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
  const result = await signInWithPopup(
    auth,
    provider
  );

  await syncUserToBackend(result.user);

  return result;
}

/* =========================
   LOGOUT
========================= */
export async function logout() {
  await signOut(auth);
}

/* =========================
   AUTH WATCHER
========================= */
export function watchUser(callback) {
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
