export const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   HELPERS
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

  if (tabId === "feed" && window.loadFeed) {
    window.loadFeed();
  }

  if (tabId === "messages" && window.loadMessages) {
    window.loadMessages("demo-user");
  }
};

/* =========================
   COOKIE HANDLER
========================= */
window.acceptCookies = function() {
  localStorage.setItem("cookieAccepted", "yes");

  const banner = el("cookieBanner");
  if (banner) {
    banner.style.display = "none";
  }
};

/* =========================
   PLACEHOLDER CALLS
========================= */
window.startCall = function() {
  const status = el("callStatus");
  if (status) {
    status.innerText = "Audio call starting...";
  }

  alert("Audio calling system connected.");
};

window.startVideoCall = function() {
  const status = el("callStatus");
  if (status) {
    status.innerText = "Video call starting...";
  }

  alert("Video calling system connected.");
};

/* =========================
   LOAD PROFILE
========================= */
window.loadProfile = async function() {
  try {
    const response = await fetch(`${API}/me`);
    const data = await response.json();

    if (el("credits")) {
      el("credits").innerText = data.credits || 0;
    }

    if (el("profileCredits")) {
      el("profileCredits").innerText = data.credits || 0;
    }

    if (el("userEmail")) {
      el("userEmail").innerText = data.email || "";
    }

    if (el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }
  } catch (error) {
    console.log("Profile load failed:", error);
  }
};

/* =========================
   MODULE LOADER
========================= */
async function loadModules() {
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

  await loadModules();

  window.switchTab("feed");

  if (window.loadFeed) {
    window.loadFeed();
  }

  window.loadProfile();

  /* =========================
     BUTTON EVENTS
  ========================= */
  el("cookieAcceptBtn")?.addEventListener("click", window.acceptCookies);

  el("uploadBtn")?.addEventListener("click", () => {
    window.switchTab("create");
  });

  el("generateBtn")?.addEventListener("click", () => {
    window.generateContent?.();
  });

  el("downloadBtn")?.addEventListener("click", () => {
    window.downloadResult?.();
  });

  el("voiceBtn")?.addEventListener("click", () => {
    window.startVoiceInput?.();
  });

  el("sendBtn")?.addEventListener("click", () => {
    window.sendMessage?.();
  });

  el("audioCallBtn")?.addEventListener("click", window.startCall);

  el("videoCallBtn")?.addEventListener("click", window.startVideoCall);
});
