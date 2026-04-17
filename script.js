const API = "https://reelmindbackend-1.onrender.com";
const ADMIN_EMAIL = "neavyartical@gmail.com";

/* =========================
   FIREBASE IMPORT
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCz9rReG2zuaj0AGuafpTzpCUopuHMD_wQ",
  authDomain: "reelmind-ai-f07cb.firebaseapp.com",
  projectId: "reelmind-ai-f07cb",
  storageBucket: "reelmind-ai-f07cb.firebasestorage.app",
  messagingSenderId: "731354245603",
  appId: "1:731354245603:web:1db1952458a8473082d8d6",
  measurementId: "G-F23DP2G9MW"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

let userToken = null;
let latestDownloadUrl = "";

/* =========================
   HELPERS
========================= */
function el(id){
  return document.getElementById(id);
}

function val(id){
  return el(id)?.value?.trim() || "";
}

function showMessage(msg){
  alert(msg);
}

/* =========================
   SPLASH FIX
========================= */
window.addEventListener("load", () => {
  if(localStorage.getItem("cookieAccepted") === "yes" && el("cookieBanner")){
    el("cookieBanner").style.display = "none";
  }

  setTimeout(() => {
    const splash = el("welcomeCard");

    if(splash){
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";

      setTimeout(() => {
        splash.remove();
      }, 700);
    }
  }, 2500);
});

/* =========================
   PAYMENT
========================= */
window.buyCredits = function(){
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

window.buyPlan = function(plan){
  const plans = {
    starter: "https://ko-fi.com/articalneavy",
    pro: "https://ko-fi.com/articalneavy",
    unlimited: "https://ko-fi.com/articalneavy"
  };

  window.open(plans[plan], "_blank");
};

/* =========================
   AUTH
========================= */
window.emailRegister = async () => {
  try{
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    showMessage("Account created");
  }catch(err){
    showMessage(err.message);
  }
};

window.emailLogin = async () => {
  try{
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
  }catch(err){
    showMessage(err.message);
  }
};

window.googleLogin = async () => {
  try{
    await signInWithPopup(auth, provider);
  }catch(err){
    showMessage(err.message);
  }
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, async(user) => {
  if(user){
    userToken = await user.getIdToken();

    if(el("userEmail")){
      el("userEmail").innerText = user.email;
    }
  }else{
    userToken = null;

    if(el("userEmail")){
      el("userEmail").innerText = "Guest Mode";
    }
  }
});

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = function(){
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    return showMessage("Voice recognition not supported");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event){
    el("prompt").value = event.results[0][0].transcript;
  };
};

/* =========================
   UPLOAD
========================= */
window.uploadMedia = function(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = function(event){
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
      latestDownloadUrl = e.target.result;

      if(file.type.startsWith("video")){
        el("result").innerHTML = `
          <div class="card">
            <video controls src="${latestDownloadUrl}"></video>
          </div>
        `;
      }else{
        el("result").innerHTML = `
          <div class="card">
            <img src="${latestDownloadUrl}">
          </div>
        `;
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = function(){
  if(!latestDownloadUrl){
    return showMessage("Nothing to download");
  }

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-content";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* =========================
   GENERATE
========================= */
window.generateContent = async () => {
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const location = val("location");

  if(!prompt){
    return showMessage("Enter prompt");
  }

  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `;

  try{
    const res = await fetch(`${API}/generate-${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userToken ? `Bearer ${userToken}` : ""
      },
      body: JSON.stringify({
        prompt,
        language,
        location
      })
    });

    const data = await res.json();

    if(mode === "text"){
      latestDownloadUrl = "";
      el("result").innerHTML = `
        <div class="card">
          ${data?.data?.content || "No response"}
        </div>
      `;
    }

    if(mode === "image"){
      latestDownloadUrl = data?.data?.url || "";
      el("result").innerHTML = `
        <div class="card">
          <img src="${latestDownloadUrl}">
        </div>
      `;
    }

    if(mode === "video"){
      latestDownloadUrl = data?.preview || data?.video || "";
      el("result").innerHTML = `
        <div class="card">
          <video controls src="${latestDownloadUrl}"></video>
        </div>
      `;
    }

  }catch{
    el("result").innerHTML = `
      <div class="card">
        Generation failed
      </div>
    `;
  }
};

/* =========================
   TABS
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".tab-section").forEach(section=>{
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function(){
  localStorage.setItem("cookieAccepted", "yes");

  if(el("cookieBanner")){
    el("cookieBanner").style.display = "none";
  }
};
