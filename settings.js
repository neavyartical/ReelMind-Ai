/* =========================
   SETTINGS MODULE
========================= */
import { el } from "./script.js";

/* =========================
   DEFAULT SETTINGS
========================= */
const defaultSettings = {
  theme: "light",
  notifications: true,
  autoplay: true,
  soundEffects: true
};

/* =========================
   STORAGE
========================= */
function getSettings() {
  const saved = localStorage.getItem("reelmind_settings");

  if (!saved) return defaultSettings;

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(saved)
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  localStorage.setItem(
    "reelmind_settings",
    JSON.stringify(settings)
  );
}

/* =========================
   APPLY SETTINGS
========================= */
function applySettings() {
  const settings = getSettings();

  document.body.classList.toggle(
    "dark-mode",
    settings.theme === "dark"
  );

  if (el("themeToggle")) {
    el("themeToggle").checked = settings.theme === "dark";
  }

  if (el("notificationsToggle")) {
    el("notificationsToggle").checked = settings.notifications;
  }

  if (el("autoplayToggle")) {
    el("autoplayToggle").checked = settings.autoplay;
  }

  if (el("soundToggle")) {
    el("soundToggle").checked = settings.soundEffects;
  }
}

/* =========================
   THEME
========================= */
window.toggleTheme = () => {
  const settings = getSettings();

  settings.theme =
    settings.theme === "dark"
      ? "light"
      : "dark";

  saveSettings(settings);
  applySettings();
};

/* =========================
   NOTIFICATIONS
========================= */
window.toggleNotifications = () => {
  const settings = getSettings();

  settings.notifications =
    el("notificationsToggle")?.checked || false;

  saveSettings(settings);
};

/* =========================
   AUTOPLAY
========================= */
window.toggleAutoplay = () => {
  const settings = getSettings();

  settings.autoplay =
    el("autoplayToggle")?.checked || false;

  saveSettings(settings);
};

/* =========================
   SOUND
========================= */
window.toggleSound = () => {
  const settings = getSettings();

  settings.soundEffects =
    el("soundToggle")?.checked || false;

  saveSettings(settings);
};

/* =========================
   LOGOUT
========================= */
window.logoutUser = async () => {
  try {
    if (window.logout) {
      await window.logout();
    }

    alert("Logged out successfully");
    location.reload();
  } catch (error) {
    console.log("Logout error:", error);
  }
};

/* =========================
   CLEAR CACHE
========================= */
window.clearAppCache = () => {
  const keepSettings = localStorage.getItem("reelmind_settings");

  localStorage.clear();
  sessionStorage.clear();

  if (keepSettings) {
    localStorage.setItem(
      "reelmind_settings",
      keepSettings
    );
  }

  alert("App cache cleared");
};

/* =========================
   DELETE ACCOUNT
========================= */
window.deleteAccount = () => {
  const confirmDelete = confirm(
    "Are you sure you want to delete your account permanently?"
  );

  if (!confirmDelete) return;

  alert("Account deletion backend can be connected next.");
};

/* =========================
   LOAD SETTINGS
========================= */
window.loadSettings = () => {
  applySettings();
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  applySettings();
});
