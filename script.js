const API = "https://reelmindbackend-1.onrender.com";

function val(id) {
  return document.getElementById(id).value;
}

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = function (tab) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active");
  });

  const selected = document.getElementById(tab);
  if (selected) selected.classList.add("active");
};

/* =========================
   AUTH PLACEHOLDERS
========================= */
window.emailLogin = function () {
  alert("Login system will be connected soon.");
};

window.emailRegister = function () {
  alert("Registration system will be connected soon.");
};

window.googleLogin = function () {
  alert("Google login will be connected soon.");
};

window.logout = function () {
  alert("Logged out successfully.");
};

/* =========================
   TYPEWRITER EFFECT
========================= */
function typeWriter(text) {
  const result = document.getElementById("result");
  result.innerHTML = `<div class="card" id="typed"></div>`;

  let i = 0;
  const typed = document.getElementById("typed");

  function write() {
    if (i < text.length) {
      typed.innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 8);
    }
  }

  write();
}

/* =========================
   GENERATE CONTENT
========================= */
document.getElementById("generate").onclick = async () => {
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = document.getElementById("result");

  if (!prompt) return;

  result.innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating your masterpiece...
    </div>
  `;

  try {
    const res = await fetch(API + "/generate-" + mode, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        language
      })
    });

    const data = await res.json();

    if (mode === "text") {
      const story =
        data?.data?.content ||
        data?.content ||
        data?.story ||
        data?.result ||
        "No response";
      typeWriter(story);
    }

    if (mode === "image") {
      const imageUrl =
        data?.data?.url ||
        data?.url ||
        data?.image ||
        "";

      result.innerHTML = imageUrl
        ? `<div class="card"><img src="${imageUrl}" alt="Generated image"></div>`
        : `<div class="card">No image returned.</div>`;
    }

    if (mode === "video") {
      const videoUrl =
        data?.video ||
        data?.url ||
        data?.preview ||
        data?.data?.url ||
        "";

      result.innerHTML = videoUrl
        ? `<div class="card"><video controls autoplay playsinline src="${videoUrl}"></video></div>`
        : `<div class="card">Video unavailable.</div>`;
    }

  } catch (error) {
    result.innerHTML = `
      <div class="card">
        ❌ Generation failed. Please try again.
      </div>
    `;
  }
};

/* =========================
   VOICE INPUT
========================= */
window.startMic = function () {
  if (!window.webkitSpeechRecognition) {
    alert("Voice input not supported on this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = e => {
    document.getElementById("prompt").value =
      e.results[0][0].transcript;
  };

  recognition.start();
};

/* =========================
   COOKIE CONSENT
========================= */
function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  const button = document.getElementById("acceptCookies");

  if (!banner || !button) return;

  const accepted = localStorage.getItem("reelmind_cookie_accept");

  if (accepted === "yes") {
    banner.style.display = "none";
    return;
  }

  button.onclick = function () {
    localStorage.setItem("reelmind_cookie_accept", "yes");

    banner.style.opacity = "0";
    banner.style.transform = "translate(-50%, 30px)";

    setTimeout(() => {
      banner.style.display = "none";
    }, 500);
  };
}

/* =========================
   PAGE LOAD
========================= */
window.addEventListener("load", () => {
  initCookieBanner();

  setTimeout(() => {
    const welcome = document.getElementById("welcomeCard");

    if (welcome) {
      welcome.style.opacity = "0";

      setTimeout(() => {
        welcome.style.display = "none";
      }, 800);
    }
  }, 7000);
});
