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
  try {
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
  } catch (error) {
    console.log("Tab switch error:", error);
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
   FILE UPLOAD
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
   RESTORE PROFILE
========================= */
function restoreLocalProfile() {
  try {
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
      savedTheme === "light" ? "light-mode" : "dark-mode"
    );
  } catch (error) {
    console.log("Profile restore error:", error);
  }
}

/* =========================
   AUTH WATCHER
========================= */
function setupAuthWatcher() {
  try {
    watchUser(user => {
      if (el("userEmail")) {
        el("userEmail").innerText = user?.email || "Guest";
      }

      if (user?.displayName && el("profileNameInput")) {
        el("profileNameInput").value = user.displayName;
      }

      if (user?.photoURL && el("profileAvatar")) {
        el("profileAvatar").src = user.photoURL;
      }

      if (el("onlineStatus")) {
        el("onlineStatus").innerText = user ? "Online" : "Offline";
      }
    });
  } catch (error) {
    console.log("Auth watcher failed:", error);
  }
}

/* =========================
   LOAD MODULES BACKGROUND
========================= */
async function loadModules() {
  const modules = [
    "./feed.js",
    "./ai.js",
    "./chat.js",
    "./settings.js"
  ];

  Promise.all(
    modules.map(async file => {
      try {
        await import(file);
        console.log("Loaded:", file);
      } catch (error) {
        console.log("Module failed:", file, error);
      }
    })
  );
}

/* =========================
   BUTTONS
========================= */
function bindButtons() {
  try {
    el("cookieAcceptBtn")?.addEventListener("click", window.acceptCookies);
    el("generateBtn")?.addEventListener("click", () => window.generateContent?.());
    el("downloadBtn")?.addEventListener("click", () => window.downloadResult?.());
    el("uploadBtn")?.addEventListener("click", window.openUpload);
    el("voiceBtn")?.addEventListener("click", () => window.startVoiceInput?.());

    el("sendBtn")?.addEventListener("click", () => window.sendMessage?.());
    el("chatUploadBtn")?.addEventListener("click", window.openChatUpload);
    el("chatMicBtn")?.addEventListener("click", () => window.startVoiceInput?.());
    el("audioCallBtn")?.addEventListener("click", () => window.startCall?.());
    el("videoCallBtn")?.addEventListener("click", () => window.startVideoCall?.());

    el("messageInput")?.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        window.sendMessage?.();
      }
    });
  } catch (error) {
    console.log("Button bind error:", error);
  }
}

/* =========================
   START APP
========================= */
function startApp() {
  try {
    restoreLocalProfile();
    setupAuthWatcher();
    bindButtons();

    window.switchTab("feed");

    setTimeout(() => {
      el("welcomeCard")?.remove();
    }, 1000);

    if (localStorage.getItem("cookieAccepted") === "yes") {
      el("cookieBanner")?.remove();
    }

    loadModules();

  } catch (error) {
    console.log("App startup failed:", error);

    el("welcomeCard")?.remove();
    document.body.style.visibility = "visible";
  }
}

window.addEventListener("load", startApp);
