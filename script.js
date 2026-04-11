const API = "https://reelmindbackend-1.onrender.com";

let currentUser = null;

/* REGISTER */
async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);
}

/* LOGIN */
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.user) {
    currentUser = data.user;
    alert("Logged in!");
  } else {
    alert("Login failed");
  }
}

/* GENERATE */
async function generate(type) {
  const prompt = document.getElementById("prompt").value;

  const res = await fetch(API + "/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      prompt,
      type,
      email: currentUser?.email
    })
  });

  const data = await res.json();

  let html = "";
  if (data.story) html += `<p>${data.story}</p>`;
  if (data.image) html += `<img src="${data.image}" />`;

  document.getElementById("result").innerHTML = html;
}

/* ASK */
async function askAI() {
  const question = document.getElementById("prompt").value;

  const res = await fetch(API + "/ask", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ question })
  });

  const data = await res.json();
  document.getElementById("result").innerHTML = `<p>${data.answer}</p>`;
}
