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
   COOKIE ACCEPT
========================= */
window.acceptCookies = function() {
  localStorage.setItem("cookieAccepted", "yes");

  const banner = el("cookieBanner");
  if (banner) {
    banner.style.display = "none";
  }
};

/* =========================
   SETTINGS ACTIONS
========================= */
window.toggleTheme = function() {
  document.body.classList.toggle("light-mode");
};

window.toggleNotifications = function() {
  alert("Notifications updated");
};

window.editProfile = function() {
  alert("Profile editing coming soon");
};

window.changePhoto = function() {
  alert("Photo upload coming soon");
};

window.logoutUser = function() {
  alert("Logout feature coming soon");
};

window.clearAppCache = function() {
  localStorage.clear();
  alert("Cache cleared");
};

window.deleteAccount = function() {
  alert("Delete account feature coming soon");
};

/* =========================
   CALL ACTIONS
========================= */
window.startCall = function() {
  const status = el("callStatus");
  if (status) {
    status.innerText = "Starting audio call...";
  }
};

window.startVideoCall = function() {
  const status = el("callStatus");
  if (status) {
    status.innerText = "Starting video call...";
  }
};

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

  window.switchTab("feed");

  try {
    await import("./feed.js");
  } catch (e) {
    console.log("feed.js failed:", e);
  }

  try {
    await import("./ai.js");
  } catch (e) {
    console.log("ai.js failed:", e);
  }

  try {
    await import("./chat.js");
  } catch (e) {
    console.log("chat.js failed:", e);
  }

  try {
    await import("./settings.js");
  } catch (e) {
    console.log("settings.js failed:", e);
  }

  /* Buttons */
  el("cookieAcceptBtn")?.addEventListener("click", window.acceptCookies);

  el("generateBtn")?.addEventListener("click", () => {
    window.generateContent?.();
  });

  el("sendBtn")?.addEventListener("click", () => {
    window.sendMessage?.();
  });

  el("voiceBtn")?.addEventListener("click", () => {
    window.startVoiceInput?.();
  });

  el("downloadBtn")?.addEventListener("click", () => {
    window.downloadResult?.();
  });

  el("uploadBtn")?.addEventListener("click", () => {
    window.switchTab("create");
  });

  el("audioCallBtn")?.addEventListener("click", window.startCall);

  el("videoCallBtn")?.addEventListener("click", window.startVideoCall);
});
