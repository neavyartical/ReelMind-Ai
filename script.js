const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   FIREBASE
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

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

/* =========================
   GLOBALS
========================= */
let userToken = null;
let latestDownloadUrl = "";
let uploadedFile = null;
let generating = false;

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
   UI RENDER
========================= */
function setLoading(text = "Generating..."){
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      ${text}
    </div>
  `;
}

function renderText(text){
  latestDownloadUrl = "";
  el("result").innerHTML = `<div class="card">${text || "No response"}</div>`;
}

function renderImage(url){
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <img src="${latestDownloadUrl}" alt="Generated">
    </div>
  `;
}

function renderVideo(url){
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <video controls playsinline src="${latestDownloadUrl}"></video>
    </div>
  `;
}

/* =========================
   PROFILE
========================= */
async function loadProfile(){
  try{
    const res = await fetch(`${API}/me`, {
      headers:{
        Authorization: userToken ? `Bearer ${userToken}` : ""
      }
    });

    const data = await res.json();

    if(el("credits")) el("credits").innerText = data.credits || 0;
    if(el("userLocation")) {
      el("userLocation").innerText =
        `${data.city || ""} ${data.country || ""}`.trim();
    }
    if(el("profileName")){
      el("profileName").innerText = data.email || "Your Profile";
    }
  }catch{
    console.log("Profile failed");
  }
}

/* =========================
   AUTH
========================= */
window.googleLogin = async () => {
  try{
    await signInWithPopup(auth, provider);
  }catch(err){
    showMessage(err.message);
  }
};

window.emailRegister = async () => {
  try{
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
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

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, async (user)=>{
  if(user){
    userToken = await user.getIdToken();

    if(el("userEmail")){
      el("userEmail").innerText = user.email;
    }

    await loadProfile();
  }else{
    userToken = null;

    if(el("userEmail")){
      el("userEmail").innerText = "Guest Mode";
    }
  }
});

/* =========================
   PROMPT BOOST
========================= */
function enhancePrompt(prompt, mode){
  let text = String(prompt || "").trim();

  if(mode === "image"){
    text += "\nmasterpiece, ultra realistic, cinematic lighting, detailed";
  }

  if(mode === "video"){
    text += "\ncinematic motion, smooth movement, professional quality";
  }

  if(mode === "text"){
    text += "\nWrite professionally with storytelling.";
  }

  return text;
}

/* =========================
   AI GENERATION
========================= */
window.generateContent = async ()=>{
  if(generating) return;

  let prompt = val("prompt");
  const mode = val("mode");

  if(!prompt){
    return showMessage("Enter a prompt");
  }

  generating = true;
  prompt = enhancePrompt(prompt, mode);

  setLoading();

  try{
    const res = await fetch(`${API}/generate-${mode}`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization: userToken ? `Bearer ${userToken}` : ""
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if(mode === "text"){
      renderText(data?.data?.content);
    }

    if(mode === "image"){
      renderImage(data?.data?.url || data?.url);
    }

    if(mode === "video"){
      renderVideo(data?.video || data?.preview);
    }

  }catch{
    renderText("Generation failed.");
  }

  generating = false;
};

/* =========================
   FEED
========================= */
async function loadFeed(){
  try{
    const res = await fetch(`${API}/videos`);
    const data = await res.json();

    const feed = el("videoFeed");
    if(!feed) return;

    feed.innerHTML = "";

    (data.videos || []).forEach(video=>{
      feed.innerHTML += `
        <div class="feed-card">
          <video controls playsinline src="${video.videoUrl}"></video>
          <h4>${video.user?.username || "User"}</h4>
          <p>${video.caption || ""}</p>
          <div class="feed-actions">
            <button onclick="showMessage('Liked')">❤️</button>
            <button onclick="switchTab('messages')">💬</button>
            <button onclick="showMessage('Shared')">📤</button>
          </div>
        </div>
      `;
    });

  }catch{
    console.log("Feed failed");
  }
}

/* =========================
   CHAT
========================= */
window.sendMessage = async ()=>{
  const text = val("messageInput");
  if(!text) return;

  try{
    await fetch(`${API}/messages/send`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        sender: auth.currentUser?.uid,
        receiver: "demo-user",
        text
      })
    });

    const box = el("messageList");

    if(box){
      box.innerHTML += `
        <div class="message sent">${text}</div>
      `;
    }

    el("messageInput").value = "";

  }catch{
    showMessage("Message failed");
  }
};

/* =========================
   CALLS
========================= */
window.startCall = ()=>{
  if(el("callStatus")){
    el("callStatus").innerText = "Audio call started...";
  }
};

window.startVideoCall = ()=>{
  if(el("callStatus")){
    el("callStatus").innerText = "Video call started...";
  }
};

/* =========================
   UPLOAD
========================= */
window.uploadMedia = ()=>{
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = (e)=>{
    uploadedFile = e.target.files[0];
    showMessage("Media uploaded");
  };

  input.click();
};

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = ()=>{
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.onresult = (e)=>{
    if(el("prompt")){
      el("prompt").value = e.results[0][0].transcript;
    }
  };

  recognition.start();
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = ()=>{
  if(!latestDownloadUrl) return;

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  a.click();
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = ()=>{
  localStorage.setItem("cookieAccepted","yes");

  if(el("cookieBanner")){
    el("cookieBanner").style.display = "none";
  }
};

/* =========================
   NAVIGATION
========================= */
window.switchTab = (tab)=>{
  document.querySelectorAll(".tab-section").forEach(section=>{
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");

  if(tab === "feed"){
    loadFeed();
  }
};

/* =========================
   STARTUP
========================= */
window.addEventListener("load", ()=>{
  loadFeed();

  if(localStorage.getItem("cookieAccepted")==="yes"){
    if(el("cookieBanner")){
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(()=>{
    const splash = el("welcomeCard");
    if(splash){
      splash.style.opacity = "0";
      setTimeout(()=> splash.remove(), 600);
    }
  },1800);
});
