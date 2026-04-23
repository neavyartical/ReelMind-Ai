
/* =========================
   SETTINGS FUNCTIONS
========================= */

function el(id) {
  return document.getElementById(id);
}

/* =========================
   THEME TOGGLE
========================= */
window.toggleTheme = () => {
  document.body.classList.toggle("dark-mode");

  const darkEnabled = document.body.classList.contains("dark-mode");

  localStorage.setItem("theme", darkEnabled ? "dark" : "light");
};

/* =========================
   LOAD SAVED SETTINGS
========================= */
window.loadSettings = () => {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  }

  const notifications = localStorage.getItem("notifications");
  if (el("notificationsToggle")) {
    el("notificationsToggle").checked = notifications !== "off";
  }
};

/* =========================
   NOTIFICATIONS
========================= */
window.toggleNotifications = () => {
  const enabled = el("notificationsToggle")?.checked;

  localStorage.setItem(
    "notifications",
    enabled ? "on" : "off"
  );
};

/* =========================
   LOGOUT
========================= */
window.logoutUser = async () => {
  try {
    if (window.logout) {
      await window.logout();
    }

    alert("Logged out");
    location.reload();
  } catch (error) {
    console.log("Logout error:", error);
  }
};

/* =========================
   CLEAR CACHE
========================= */
window.clearAppCache = () => {
  localStorage.clear();
  sessionStorage.clear();

  alert("App cache cleared");
};

/* =========================
   DELETE ACCOUNT PLACEHOLDER
========================= */
window.deleteAccount = () => {
  const confirmDelete = confirm(
    "Are you sure you want to delete your account?"
  );

  if (!confirmDelete) return;

  alert("Account deletion feature can be connected later.");
};
