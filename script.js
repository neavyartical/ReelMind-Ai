export const API = "https://reelmindbackend-1.onrender.com";

import { watchUser } from "./firebase.js";
import "./socket.js";

/* =========================
   ELEMENT HELPER
========================= */
export function el(id) {
  return document.getElementById(id);
}

/* =========================
   TAB SWITCHER
========================= */
window.switchTab = function(tabId) {
  document.querySelectorAll(".tab-section").forEach(section => {
    section.style.display = "none";
    section.classList.remove("active");
  });

  const target = el(tabId);

  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  const downloadBtn = el("downloadBtn");
  if (downloadBtn) {
    downloadBtn.style.display =
      tabId === "create" ? "block" : "none";
  }

  if (tabId === "feed") {
    window.loadFeed?.();
  }

  if (tabId === "messages") {
    window.loadMessages?.();
  }
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function() {
  localStorage.setItem("cookieAccepted", "yes");
  el("cookieBanner")?.remove();
};

/* =========================
   CALL STATUS
========================= */
window.showCallStatus = function(text) {
  const status = el("callStatus");
  if (!status) return;

  status.innerText = text;

  clearTimeout(window.callTimer);

  window.callTimer = setTimeout(() => {
    status.innerText = "";
  }, 3000);
};

/* =========================
   GLOBAL UPLOAD
========================= */
window.openUpload = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    window.handleUploadFile?.(file);
    window.switchTab("create");
  };

  input.click();
};

/* =========================
   CHAT UPLOAD
========================= */
window.openChatUpload = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*,audio/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    window.sendChatFile?.(file);
  };

  input.click();
};

/* =========================
   RESTORE LOCAL PROFILE
========================= */
function restoreLocalProfile() {
  const savedName = localStorage.getItem("profileName");
  const savedAvatar = localStorage.getItem("profileAvatar");
  const savedTheme = localStorage.getItem("theme");

  if (savedName && el("profileNameInput")) {
    el("profileNameInput").value = savedName;
  }

  if (savedAvatar && el("profileAvatar")) {
    el("profileAvatar").src = savedAvatar;
  }

  document.body.classList.remove("light-mode", "dark-mode");

  document.body.classList.add(
    savedTheme === "light"
      ? "light-mode"
      : "dark-mode"
  );
}

/* =========================
   AUTH UI
========================= */
function setupAuthWatcher() {
  watchUser(user => {
    if (el("userEmail")) {
      el("userEmail").innerText =
        user?.email || "Guest";
    }

    if (user?.displayName && el("profileNameInput")) {
      el("profileNameInput").value =
        user.displayName;
    }

    if (user?.photoURL && el("profileAvatar")) {
      el("profileAvatar").src =
        user.photoURL;
    }

    if (el("onlineStatus")) {
      el("onlineStatus").innerText =
        user ? "Online" : "Offline";
    }
  });
}

/* =========================
   LOAD MODULES
========================= */
async function loadModules() {
  const modules = [
    "./feed.js",
    "./ai.js",
    "./chat.js",
    "./settings.js"
  ];

  for (const file of modules) {
    try {
      await import(file);
    } catch (error) {
      console.log("Module failed:", file, error);
    }
  }
}

/* =========================
   BUTTON BINDINGS
========================= */
function bindButtons() {
  el("cookieAcceptBtn")?.onclick =
    window.acceptCookies;

  el("generateBtn")?.onclick =
    () => window.generateContent?.();

  el("downloadBtn")?.onclick =
    () => window.downloadResult?.();

  el("uploadBtn")?.onclick =
    window.openUpload;

  el("voiceBtn")?.onclick =
    () => window.startVoiceInput?.();

  /* CHAT */
  el("sendBtn")?.onclick =
    () => window.sendMessage?.();

  el("chatUploadBtn")?.onclick =
    window.openChatUpload;

  el("chatMicBtn")?.onclick =
    () => window.startVoiceInput?.();

  el("audioCallBtn")?.onclick =
    () => window.startCall?.();

  el("videoCallBtn")?.onclick =
    () => window.startVideoCall?.();

  el("messageInput")?.addEventListener(
    "keypress",
    e => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.sendMessage?.();
      }
    }
  );
}

/* =========================
   START APP
========================= */
window.addEventListener("load", async () => {
  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1200);

  if (localStorage.getItem("cookieAccepted") === "yes") {
    el("cookieBanner")?.remove();
  }

  restoreLocalProfile();

  setupAuthWatcher();

  await loadModules();

  bindButtons();

  window.switchTab("feed");
});
