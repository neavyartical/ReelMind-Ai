export const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   ELEMENT HELPER
========================= */
export function el(id) {
  return document.getElementById(id);
}

/* =========================
   SAFE TAB SWITCHER
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
   UPLOAD BUTTON
========================= */
window.openUpload = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    localStorage.setItem("lastUploadName", file.name);

    alert("Selected: " + file.name);

    window.switchTab("create");
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

  if (savedName && el("profileName")) {
    el("profileName").innerText = savedName;
  }

  if (savedAvatar && el("profileAvatar")) {
    el("profileAvatar").src = savedAvatar;
  }

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
}

/* =========================
   LOAD MODULES
========================= */
async function loadModules() {
  const files = [
    "./feed.js",
    "./ai.js",
    "./chat.js",
    "./settings.js"
  ];

  for (const file of files) {
    try {
      await import(file);
    } catch (error) {
      console.log(`${file} failed`, error);
    }
  }
}

/* =========================
   BIND BUTTONS
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

  el("sendBtn")?.addEventListener(
    "click",
    () => window.sendMessage?.()
  );

  el("voiceBtn")?.addEventListener(
    "click",
    () => window.startVoiceInput?.()
  );

  el("downloadBtn")?.addEventListener(
    "click",
    () => window.downloadResult?.()
  );

  el("uploadBtn")?.addEventListener(
    "click",
    window.openUpload
  );

  el("audioCallBtn")?.addEventListener(
    "click",
    () => window.startCall?.()
  );

  el("videoCallBtn")?.addEventListener(
    "click",
    () => window.startVideoCall?.()
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

  restoreProfile();

  await loadModules();

  bindButtons();

  window.switchTab("feed");
});
