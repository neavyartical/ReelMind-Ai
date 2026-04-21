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

/* =========================
   SOCKET
========================= */
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io(API);

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
let selectedUser = "demo-user";

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
   SOCKET EVENTS
========================= */
socket.on("online-users", (users) => {
  if (el("onlineStatus")) {
    el("onlineStatus").innerText = "Online";
  }
});

socket.on("receive-message", (data) => {
  const box = el("messageList");
  if (!box) return;

  box.innerHTML += `
    <div class="message received">${data.text}</div>
  `;

  box.scrollTop = box.scrollHeight;
});

socket.on("incoming-call", (data) => {
  const accept = confirm(`${data.callerName || "Someone"} is calling you`);

  if (accept) {
    socket.emit("answer-call", {
      callerId: data.callerId,
      receiverId: auth.currentUser?.uid
    });

    if (el("callStatus")) {
      el("callStatus").innerText = "Call connected";
    }
  } else {
    socket.emit("reject-call", {
      callerId: data.callerId,
      receiverId: auth.currentUser?.uid
    });
  }
});

socket.on("call-answered", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call answered";
  }
});

socket.on("call-rejected", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call rejected";
  }
});

socket.on("call-ended", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call ended";
  }
});

/* =========================
   UI RENDER
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
  latestDownloadUrl = "";
  el("result").innerHTML = `
    <div class="card">${text || "No response"}</div>
  `;
}

function renderImage(url) {
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <img src="${latestDownloadUrl}" alt="Generated">
    </div>
  `;
}

function renderVideo(url) {
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <video controls playsinline src="${latestDownloadUrl}"></video>
    </div>
  `;
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

    if (el("credits")) el("credits").innerText = data.credits || 0;
    if (el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }

    if (el("profileName")) {
      el("profileName").innerText = data.email || "Your Profile";
    }
  } catch {}
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
   AI GENERATION
========================= */
window.generateContent = async () => {
  if (generating) return;

  const prompt = val("prompt");
  const mode = val("mode");

  if (!prompt) return showMessage("Enter prompt");

  generating = true;
  setLoading();

  try {
    const res = await fetch(`${API}/generate-${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userToken ? `Bearer ${userToken}` : ""
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (mode === "text") renderText(data?.data?.content);
    if (mode === "image") renderImage(data?.data?.url);
    if (mode === "video") renderVideo(data?.preview || data?.video);
  } catch {
    renderText("Generation failed");
  }

  generating = false;
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

  socket.emit("send-message", {
    senderId: auth.currentUser?.uid,
    receiverId: selectedUser,
    text
  });

  const box = el("messageList");

  if (box) {
    box.innerHTML += `
      <div class="message sent">${text}</div>
    `;
    box.scrollTop = box.scrollHeight;
  }

  el("messageInput").value = "";
};

/* =========================
   CALLS
========================= */
window.startCall = () => {
  socket.emit("call-user", {
    callerId: auth.currentUser?.uid,
    receiverId: selectedUser,
    callerName: auth.currentUser?.email,
    type: "audio"
  });

  el("callStatus").innerText = "Calling...";
};

window.startVideoCall = () => {
  socket.emit("call-user", {
    callerId: auth.currentUser?.uid,
    receiverId: selectedUser,
    callerName: auth.currentUser?.email,
    type: "video"
  });

  el("callStatus").innerText = "Video calling...";
};

/* =========================
   UTILITIES
========================= */
window.uploadMedia = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
};

window.startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.onresult = (e) => {
    el("prompt").value = e.results[0][0].transcript;
  };

  recognition.start();
};

window.downloadResult = () => {
  if (!latestDownloadUrl) return;

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  a.click();
};

window.acceptCookies = () => {
  localStorage.setItem("cookieAccepted", "yes");
  if (el("cookieBanner")) {
    el("cookieBanner").style.display = "none";
  }
};

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
   STARTUP
========================= */
window.addEventListener("load", () => {
  loadFeed();

  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) splash.remove();
  }, 1800);
});
