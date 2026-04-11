const API = "https://reelmindbackend-1.onrender.com";

let user = null;

/* LOAD USER */
window.onload = () => {
  const saved = localStorage.getItem("user");
  if (saved) {
    user = JSON.parse(saved);
    showApp();
  }
};

/* SHOW APP */
function showApp() {
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");
  document.getElementById("credits").innerText = user.credits;
}

/* LOGIN */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.user) {
    user = data.user;
    localStorage.setItem("user", JSON.stringify(user));
    showApp();
  } else {
    alert("Login failed");
  }
}

/* REGISTER */
async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.user) {
    alert("Registered! Now login.");
  } else {
    alert("Error registering");
  }
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

/* GENERATE */
async function generate(type) {
  const prompt = document.getElementById("prompt").value;
  const result = document.getElementById("result");

  if (!prompt) {
    result.innerHTML = "⚠️ Enter something";
    return;
  }

  result.innerHTML = "⏳ Generating...";

  const res = await fetch(`${API}/generate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ prompt, type, email: user.email })
  });

  const data = await res.json();

  if (data.credits !== undefined) {
    user.credits = data.credits;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("credits").innerText = user.credits;
  }

  if (type === "image") {
    result.innerHTML = `<img src="${data.output}" />`;
  } else {
    result.innerHTML = `<p>${data.output}</p>`;
  }
}

/* ASK AI */
function askAI() {
  generate("all");
}

/* DOWNLOAD */
function downloadResult() {
  const content = document.getElementById("result").innerText;
  const blob = new Blob([content], { type: "text/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reelmind.txt";
  link.click();
}
