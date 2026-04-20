const API = "https://reelmindbackend-1.onrender.com";

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

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

/* =========================
   GLOBALS
========================= */
let userToken = null;
let latestDownloadUrl = "";
let generating = false;

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

/* =========================
   RENDER
========================= */
function setLoading(text = "Generating...") {
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      ${text}
    </div>
  `;
}

function renderText(text) {
  el("result").innerHTML = `<div class="card">${text}</div>`;
}

function renderImage(url) {
  latestDownloadUrl = url;
  el("result").innerHTML = `
    <div class="card">
      <img src="${url}" />
    </div>
  `;
}

function renderVideo(url) {
  latestDownloadUrl = url;
  el("result").innerHTML = `
    <div class="card">
      <video controls playsinline src="${url}"></video>
    </div>
  `;
}

/* =========================
   AUTH
========================= */
window.googleLogin = async () => {
  await signInWithPopup(auth, provider);
};

window.emailRegister = async () => {
  await createUserWithEmailAndPassword(auth, val("email"), val("password"));
};

window.emailLogin = async () => {
  await signInWithEmailAndPassword(auth, val("email"), val("password"));
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, async user => {
  if (!user) return;

  userToken = await user.getIdToken();

  if (el("userEmail")) {
    el("userEmail").innerText = user.email;
  }
});

/* =========================
   AI GENERATION
========================= */
window.generateContent = async () => {
  const prompt = val("prompt");
  const mode = val("mode");

  if (!prompt) return showMessage("Enter a prompt");

  setLoading();

  const res = await fetch(`${API}/generate-${mode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: userToken ? `Bearer ${userToken}` : ""
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  if (mode === "text") renderText(data?.data?.content || "No text");
  if (mode === "image") renderImage(data?.data?.url || data?.url);
  if (mode === "video") renderVideo(data?.video || data?.preview);
};

/* =========================
   FEED
========================= */
async function loadFeed() {
  const res = await fetch(`${API}/videos`);
  const data = await res.json();

  const feed = el("videoFeed");
  if (!feed) return;

  feed.innerHTML = "";

  (data.videos || []).forEach(video => {
    feed.innerHTML += `
      <div class="feed-card">
        <video controls playsinline src="${video.videoUrl}"></video>
        <h4>${video.user?.username || "User"}</h4>
        <p>${video.caption || ""}</p>
      </div>
    `;
  });
}

/* =========================
   CHAT
========================= */
window.sendMessage = async () => {
  const text = val("messageInput");
  if (!text) return;

  await fetch(`${API}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: auth.currentUser?.uid,
      receiver: "demo-user",
      text
    })
  });

  el("messageInput").value = "";
};

/* =========================
   CALL
========================= */
window.startCall = () => {
  showMessage("Call feature ready");
};

/* =========================
   NAVIGATION
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");

  if (tab === "feed") {
    loadFeed();
  }
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = () => {
  if (!latestDownloadUrl) return;

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  a.click();
};

/* =========================
   START
========================= */
window.addEventListener("load", () => {
  loadFeed();

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) splash.style.display = "none";
  }, 1800);
});
