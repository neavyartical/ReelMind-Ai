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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
   PROFILE LOADER
========================= */
async function loadProfile() {
  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: userToken ? `Bearer ${userToken}` : ""
      }
    });

    const data = await res.json();

    if (el("credits")) {
      el("credits").innerText = data.credits ?? 0;
    }

    if (el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }
  } catch {
    console.log("Profile load failed");
  }
}

/* =========================
   PROMPT ENHANCER
========================= */
function enhancePrompt(prompt, mode) {
  let clean = String(prompt || "").trim();

  if (!clean) return "";

  if (mode === "image") {
    clean = `
${clean}

Keep the exact subject from the user's request.
Do not change the main character.
Do not add unrelated objects.
Improve quality only.

STYLE:
masterpiece,
best quality,
ultra realistic,
photorealistic,
highly detailed,
sharp focus,
cinematic lighting,
professional photography,
natural skin texture,
realistic face,
correct anatomy,
realistic hands,
depth of field,
clean composition,
8k detail

NEGATIVE:
blurry,
low quality,
deformed,
extra fingers,
extra arms,
duplicate face,
crooked eyes,
watermark,
logo,
random text,
distorted body
`.trim();
  }

  if (mode === "video") {
    clean = `
${clean}

Keep the exact original scene.
Do not change the subject.

STYLE:
cinematic motion,
smooth camera movement,
natural movement,
realistic lighting,
professional film quality,
high detail
`.trim();
  }

  if (mode === "text") {
    clean = `
${clean}

Write professionally with:
correct grammar,
natural wording,
immersive storytelling,
clear structure
`.trim();
  }

  return clean;
}

/* =========================
   SPLASH
========================= */
window.addEventListener("load", () => {
  if (localStorage.getItem("cookieAccepted") === "yes") {
    if (el("cookieBanner")) {
      el("cookieBanner").style.display = "none";
    }
  }

  const pendingTask = localStorage.getItem("pendingVideoTask");
  if (pendingTask) {
    checkVideoStatus(pendingTask);
  }

  setTimeout(() => {
    const splash = el("welcomeCard");
    if (splash) {
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";
      setTimeout(() => splash.remove(), 700);
    }
  }, 1800);
});

/* =========================
   AUTH
========================= */
window.emailRegister = async () => {
  try {
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    showMessage("Account created");
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

    if (el("userEmail")) {
      el("userEmail").innerText = user.email;
    }

    await loadProfile();
  } else {
    userToken = null;

    if (el("userEmail")) {
      el("userEmail").innerText = "Guest Mode";
    }

    if (el("credits")) {
      el("credits").innerText = "0";
    }

    if (el("userLocation")) {
      el("userLocation").innerText = "";
    }
  }
});

/* =========================
   PAYMENTS
========================= */
window.buyCredits = () => {
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

window.buyPlan = () => {
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    if (el("prompt")) {
      el("prompt").value = event.results[0][0].transcript;
    }
  };

  recognition.start();
};

/* =========================
   MEDIA UPLOAD
========================= */
window.uploadMedia = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadedFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      latestDownloadUrl = event.target.result;

      if (file.type.startsWith("video")) {
        renderVideo(latestDownloadUrl);
      } else {
        el("result").innerHTML = `
          <div class="card">
            <img src="${latestDownloadUrl}">
            <p style="margin-top:12px;color:#00d9ff;">
              Image uploaded — describe the edit and tap Generate
            </p>
          </div>
        `;
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = () => {
  if (!latestDownloadUrl) return showMessage("Nothing to download");

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* =========================
   VIDEO STATUS
========================= */
async function checkVideoStatus(taskId) {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API}/video-status/${taskId}`);
      const data = await res.json();

      if (data.status === "completed" && data.video) {
        clearInterval(interval);
        localStorage.removeItem("pendingVideoTask");
        renderVideo(data.video);
        generating = false;
      }

      if (data.status === "failed") {
        clearInterval(interval);
        localStorage.removeItem("pendingVideoTask");
        renderText("Video generation failed.");
        generating = false;
      }
    } catch {}
  }, 8000);
}

/* =========================
   GENERATE
========================= */
window.generateContent = async () => {
  if (generating) return showMessage("Please wait...");

  let prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const location = val("location");

  if (!prompt) return showMessage("Enter a prompt first");

  generating = true;
  prompt = enhancePrompt(prompt, mode);

  setLoading();

  try {
    let response;

    if (uploadedFile && mode === "image") {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("prompt", prompt);
      formData.append("language", language);
      formData.append("location", location);

      response = await fetch(`${API}/edit-image`, {
        method: "POST",
        headers: {
          Authorization: userToken ? `Bearer ${userToken}` : ""
        },
        body: formData
      });
    } else {
      response = await fetch(`${API}/generate-${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({ prompt, language, location })
      });
    }

    const data = await response.json();

    if (mode === "text") {
      renderText(data?.data?.content);
      generating = false;
    }

    if (mode === "image") {
      renderImage(data?.data?.url || data?.url);
      generating = false;
    }

    if (mode === "video") {
      if (data?.taskId) {
        localStorage.setItem("pendingVideoTask", data.taskId);
        setLoading("Video is rendering...");
        checkVideoStatus(data.taskId);
      } else {
        renderVideo(data?.preview || data?.video);
        generating = false;
      }
    }

    uploadedFile = null;
  } catch {
    renderText("Generation failed. Please try again.");
    generating = false;
  }
};

/* =========================
   TABS
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
  if (el("cookieBanner")) el("cookieBanner").style.display = "none";
};
