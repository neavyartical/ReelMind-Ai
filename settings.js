/* =========================
   SETTINGS MODULE
========================= */
import { el } from "./script.js";

/* =========================
   DEFAULT SETTINGS
========================= */
const defaultSettings = {
  theme: "dark",
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
    "light-mode",
    settings.theme === "light"
  );

  document.body.classList.toggle(
    "dark-mode",
    settings.theme === "dark"
  );

  if (el("themeToggle")) {
    el("themeToggle").checked =
      settings.theme === "dark";
  }

  if (el("notificationsToggle")) {
    el("notificationsToggle").checked =
      settings.notifications;
  }

  if (el("autoplayToggle")) {
    el("autoplayToggle").checked =
      settings.autoplay;
  }

  if (el("soundToggle")) {
    el("soundToggle").checked =
      settings.soundEffects;
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
   EDIT PROFILE
========================= */
window.editProfile = () => {
  const currentName =
    el("profileName")?.innerText || "";

  const newName = prompt(
    "Enter your new profile name:",
    currentName
  );

  if (!newName) return;

  localStorage.setItem(
    "profileName",
    newName
  );

  if (el("profileName")) {
    el("profileName").innerText = newName;
  }
};

/* =========================
   CHANGE PHOTO
========================= */
window.changePhoto = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      localStorage.setItem(
        "profileAvatar",
        image
      );

      if (el("profileAvatar")) {
        el("profileAvatar").src = image;
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* =========================
   LOAD PROFILE
========================= */
function loadProfile() {
  const savedName =
    localStorage.getItem("profileName");

  const savedAvatar =
    localStorage.getItem("profileAvatar");

  if (savedName && el("profileName")) {
    el("profileName").innerText = savedName;
  }

  if (savedAvatar && el("profileAvatar")) {
    el("profileAvatar").src = savedAvatar;
  }
}

/* =========================
   LOGOUT
========================= */
window.logoutUser = async () => {
  const ok = confirm("Logout now?");
  if (!ok) return;

  alert("Logout backend can be connected next.");
};

/* =========================
   CLEAR CACHE
========================= */
window.clearAppCache = () => {
  const keepSettings =
    localStorage.getItem("reelmind_settings");
  const keepName =
    localStorage.getItem("profileName");
  const keepAvatar =
    localStorage.getItem("profileAvatar");

  localStorage.clear();
  sessionStorage.clear();

  if (keepSettings) {
    localStorage.setItem(
      "reelmind_settings",
      keepSettings
    );
  }

  if (keepName) {
    localStorage.setItem(
      "profileName",
      keepName
    );
  }

  if (keepAvatar) {
    localStorage.setItem(
      "profileAvatar",
      keepAvatar
    );
  }

  alert("App cache cleared");
};

/* =========================
   DELETE ACCOUNT
========================= */
window.deleteAccount = () => {
  const ok = confirm(
    "Delete your account permanently?"
  );

  if (!ok) return;

  localStorage.clear();
  sessionStorage.clear();

  alert("Account deleted locally.");
  location.reload();
};

/* =========================
   LOAD SETTINGS
========================= */
window.loadSettings = () => {
  applySettings();
  loadProfile();
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", () => {
  applySettings();
  loadProfile();
});
