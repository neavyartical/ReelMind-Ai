const API = "https://reelmindbackend-1.onrender.com";

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
let uploadedFile = null;
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
   PROFILE
========================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: userToken ? `Bearer ${userToken}` : ""
      }
    });

    const data = await res.json();

    if (el("credits")) el("credits").innerText = data.credits ?? 0;
    if (el("profileName")) el("profileName").innerText = data.email || "Your Profile";
    if (el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }
  } catch {}
}

/* =========================
   FEED
========================= */
async function loadFeed() {
  try {
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

          <button class="action" onclick="likeVideo('${video._id}')">
            ❤️ ${video.likes?.length || 0}
          </button>
        </div>
      `;
    });
  } catch {
    console.log("Feed failed");
  }
}

/* =========================
   LIKE VIDEO
========================= */
window.likeVideo = async (videoId) => {
  try {
    await fetch(`${API}/videos/${videoId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: auth.currentUser?.uid || "guest"
      })
    });

    loadFeed();
  } catch {
    showMessage("Unable to like video");
  }
};

/* =========================
   MESSAGES
========================= */
async function loadMessages() {
  try {
    const userId = auth.currentUser?.uid;
    const targetId = "demo-user";

    if (!userId) return;

    const res = await fetch(`${API}/messages/${userId}/${targetId}`);
    const data = await res.json();

    const box = el("messageList");
    if (!box) return;

    box.innerHTML = "";

    (data.messages || []).forEach(msg => {
      const own = msg.sender === userId;

      box.innerHTML += `
        <div class="message ${own ? "sent" : "received"}">
          ${msg.text}
        </div>
      `;
    });
  } catch {
    console.log("Messages failed");
  }
}

window.sendMessage = async () => {
  const text = val("messageInput");
  const userId = auth.currentUser?.uid;

  if (!text || !userId) return;

  try {
    await fetch(`${API}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: userId,
        receiver: "demo-user",
        text
      })
    });

    el("messageInput").value = "";
    loadMessages();
  } catch {
    showMessage("Message failed");
  }
};

/* =========================
   CALLS
========================= */
window.startCall = () => {
  showMessage("Audio call feature started");
};

/* =========================
   AUTH
========================= */
window.emailRegister = async () => {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userToken = await user.getIdToken();
    if (el("userEmail")) el("userEmail").innerText = user.email;
    await loadProfile();
  } else {
    userToken = null;
    if (el("userEmail")) el("userEmail").innerText = "Guest Mode";
  }
});

/* =========================
   NAVIGATION
========================= */
window.switchTab = (tab) => {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");

  if (tab === "feed") loadFeed();
  if (tab === "messages") loadMessages();
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  loadFeed();

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) splash.style.display = "none";
  }, 1800);
});
