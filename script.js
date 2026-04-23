export const API = "https://reelmindbackend-1.onrender.com";

export function el(id) {
  return document.getElementById(id);
}

/* =========================
   SAFE TAB SWITCH
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
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function() {
  localStorage.setItem("cookieAccepted", "yes");

  const banner = el("cookieBanner");
  if (banner) {
    banner.style.display = "none";
  }
};

/* =========================
   BASIC BUTTONS
========================= */
window.startCall = () => alert("Audio call coming soon");
window.startVideoCall = () => alert("Video call coming soon");

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

  el("cookieAcceptBtn")?.addEventListener("click", window.acceptCookies);
  el("uploadBtn")?.addEventListener("click", () => window.switchTab("create"));
  el("audioCallBtn")?.addEventListener("click", window.startCall);
  el("videoCallBtn")?.addEventListener("click", window.startVideoCall);
});
