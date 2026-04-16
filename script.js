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

function el(id){ return document.getElementById(id); }
function val(id){ return el(id)?.value?.trim() || ""; }

function showMessage(msg){
  alert(msg);
}

window.buyCredits = function(){
  window.open("https://ko-fi.com/articalneavy","_blank");
};

window.buyPlan = function(plan){
  const plans = {
    starter:"https://ko-fi.com/articalneavy",
    pro:"https://ko-fi.com/articalneavy",
    unlimited:"https://ko-fi.com/articalneavy"
  };
  window.open(plans[plan],"_blank");
};

window.emailRegister = async ()=>{
  try{
    await createUserWithEmailAndPassword(auth,val("email"),val("password"));
  }catch(err){
    showMessage(err.message);
  }
};

window.emailLogin = async ()=>{
  try{
    await signInWithEmailAndPassword(auth,val("email"),val("password"));
  }catch(err){
    showMessage(err.message);
  }
};

window.googleLogin = async ()=>{
  try{
    await signInWithPopup(auth,provider);
  }catch(err){
    showMessage(err.message);
  }
};

window.logout = async ()=>{
  await signOut(auth);
};

onAuthStateChanged(auth, async(user)=>{
  if(user){
    userToken = await user.getIdToken();
    el("userEmail").innerText = user.email;
  }else{
    userToken = null;
    el("userEmail").innerText = "Guest Mode";
  }
});

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = function(){
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    return alert("Voice recognition not supported");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event){
    el("prompt").value = event.results[0][0].transcript;
  };
};

/* =========================
   FILE UPLOAD
========================= */
window.triggerUpload = function(){
  el("fileInput").click();
};

window.handleUpload = function(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(e){
    el("result").innerHTML = `
      <div class="card">
        <img src="${e.target.result}">
        <button class="download-btn" onclick="downloadResult()">Download</button>
      </div>
    `;
  };
  reader.readAsDataURL(file);
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = function(){
  const img = document.querySelector("#result img");
  const video = document.querySelector("#result video");

  const url = img?.src || video?.src;
  if(!url) return alert("Nothing to download");

  const a = document.createElement("a");
  a.href = url;
  a.download = "reelmind-content";
  a.click();
};

/* =========================
   GENERATE
========================= */
window.generateContent = async ()=>{
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");

  if(!prompt) return showMessage("Enter prompt");

  el("result").innerHTML = `<div class="card"><div class="spinner"></div>Generating...</div>`;

  try{
    const res = await fetch(`${API}/generate-${mode}`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:userToken ? `Bearer ${userToken}` : ""
      },
      body:JSON.stringify({prompt,language})
    });

    const data = await res.json();

    if(mode==="text"){
      el("result").innerHTML = `
        <div class="card">
          ${data?.data?.content || "No response"}
          <button class="download-btn" onclick="downloadResult()">Download</button>
        </div>`;
    }

    if(mode==="image"){
      el("result").innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}">
          <button class="download-btn" onclick="downloadResult()">Download</button>
        </div>`;
    }

    if(mode==="video"){
      el("result").innerHTML = `
        <div class="card">
          <video controls src="${data?.preview || data?.video}"></video>
          <button class="download-btn" onclick="downloadResult()">Download</button>
        </div>`;
    }

  }catch{
    el("result").innerHTML = `<div class="card">Generation failed</div>`;
  }
};

window.switchTab = function(tab){
  document.querySelectorAll(".tab-section").forEach(s=>s.classList.remove("active"));
  el(tab)?.classList.add("active");
};

window.acceptCookies = function(){
  localStorage.setItem("cookieAccepted","yes");
  el("cookieBanner").style.display="none";
};
