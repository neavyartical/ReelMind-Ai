export const API = "https://reelmindbackend-1.onrender.com";

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

  if (tabId === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tabId === "messages" && window.loadMessages) {
    window.loadMessages();
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

  setTimeout(() => {
    status.innerText = "";
  }, 3000);
};

/* =========================
   GLOBAL FILE PICKER
========================= */
window.openUpload = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    localStorage.setItem("lastUploadName", file.name);

    if (window.handleUploadFile) {
      window.handleUploadFile(file);
    }

    window.switchTab("create");
  };

  input.click();
};

/* =========================
   CHAT FILE PICKER
========================= */
window.openChatUpload = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*,audio/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    if (window.sendChatFile) {
      window.sendChatFile(file);
    } else {
      alert("Selected: " + file.name);
    }
  };

  input.click();
};

/* =========================
   RESTORE PROFILE
========================= */
function restoreProfile() {
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

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.add("dark-mode");
  }
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
  el("cookieAcceptBtn")?.addEventListener(
    "click",
    window.acceptCookies
  );

  el("generateBtn")?.addEventListener(
    "click",
    () => window.generateContent?.()
  );

  el("downloadBtn")?.addEventListener(
    "click",
    () => window.downloadResult?.()
  );

  el("uploadBtn")?.addEventListener(
    "click",
    window.openUpload
  );

  el("voiceBtn")?.addEventListener(
    "click",
    () => window.startVoiceInput?.()
  );

  /* Chat */
  el("sendBtn")?.addEventListener(
    "click",
    () => window.sendMessage?.()
  );

  el("chatUploadBtn")?.addEventListener(
    "click",
    window.openChatUpload
  );

  el("chatMicBtn")?.addEventListener(
    "click",
    () => window.startVoiceInput?.()
  );

  el("audioCallBtn")?.addEventListener(
    "click",
    () => window.startCall?.()
  );

  el("videoCallBtn")?.addEventListener(
    "click",
    () => window.startVideoCall?.()
  );

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
   APP START
========================= */
window.addEventListener("load", async () => {
  setTimeout(() => {
    el("welcomeCard")?.remove();
  }, 1200);

  if (localStorage.getItem("cookieAccepted") === "yes") {
    el("cookieBanner")?.remove();
  }

  restoreProfile();

  await loadModules();

  bindButtons();

  window.switchTab("feed");
});
