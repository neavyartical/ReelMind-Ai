const API = "https://reelmindbackend-1.onrender.com";

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
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

let userToken = null;

/* =========================
   HELPERS
========================= */
function el(id){
  return document.getElementById(id);
}

function val(id){
  return el(id)?.value || "";
}

function setUserInfo(email, credits){
  if(el("userEmail")) el("userEmail").innerText = email;
  if(el("credits")) el("credits").innerText = credits;
}

/* =========================
   BUY CREDITS
========================= */
window.buyCredits = function(){
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

/* =========================
   LOAD PROFILE
========================= */
async function loadUserProfile(){
  if(!userToken) return;

  try{
    const res = await fetch(`${API}/me`,{
      headers:{
        Authorization:`Bearer ${userToken}`
      }
    });

    const data = await res.json();
    setUserInfo(data.email || "Guest", data.credits || 0);

  }catch{
    setUserInfo("Guest", 0);
  }
}

/* =========================
   AUTH
========================= */
window.emailRegister = async ()=>{
  try{
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    alert("Account created successfully");
  }catch(err){
    alert(err.message);
  }
};

window.emailLogin = async ()=>{
  try{
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
  }catch(err){
    alert(err.message);
  }
};

window.googleLogin = async ()=>{
  try{
    await signInWithPopup(auth, provider);
  }catch(err){
    alert(err.message);
  }
};

window.logout = async ()=>{
  await signOut(auth);
};

onAuthStateChanged(auth, async user=>{
  if(user){
    userToken = await user.getIdToken();
    loadUserProfile();
  }else{
    userToken = null;
    setUserInfo("Guest Mode", "∞");
  }
});

/* =========================
   TABS
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(section=>{
    section.classList.remove("active");
  });

  const target = el(tab);
  if(target){
    target.classList.add("active");
  }
};

/* =========================
   TYPEWRITER
========================= */
function typeWriter(text){
  const result = el("result");
  result.innerHTML = `<div class="card" id="typedText"></div>`;

  let i = 0;
  const target = el("typedText");

  function write(){
    if(i < text.length){
      target.innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 6);
    }
  }

  write();
}

/* =========================
   LOADING UI
========================= */
function showLoading(mode){
  const result = el("result");

  result.innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      <p id="loadingText">Preparing ${mode}...</p>
    </div>
  `;

  const texts = [
    "Analyzing prompt...",
    "Generating cinematic quality...",
    "Optimizing output...",
    "Almost done..."
  ];

  let i = 0;
  const interval = setInterval(()=>{
    const txt = el("loadingText");
    if(txt){
      txt.innerText = texts[i % texts.length];
      i++;
    }
  }, 1800);

  return interval;
}

/* =========================
   VIDEO WAIT
========================= */
async function waitForVideo(taskId){
  const result = el("result");

  for(let i=0;i<25;i++){
    await new Promise(r=>setTimeout(r,4000));

    const res = await fetch(`${API}/video-status/${taskId}`);
    const data = await res.json();

    if(data.video){
      result.innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${data.video}"></video>
        </div>
      `;
      loadUserProfile();
      return;
    }
  }

  result.innerHTML = `
    <div class="card">
      Video still processing...
    </div>
  `;
}

/* =========================
   GENERATE
========================= */
el("generate").onclick = async ()=>{
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = el("result");

  if(!prompt){
    alert("Please enter a prompt");
    return;
  }

  const loadingInterval = showLoading(mode);

  try{
    const headers = {
      "Content-Type":"application/json"
    };

    if(userToken){
      headers.Authorization = `Bearer ${userToken}`;
    }

    const res = await fetch(`${API}/generate-${mode}`,{
      method:"POST",
      headers,
      body: JSON.stringify({
        prompt,
        language
      })
    });

    clearInterval(loadingInterval);

    const data = await res.json();

    if(data.error){
      result.innerHTML = `<div class="card">${data.error}</div>`;
      return;
    }

    if(mode === "text"){
      typeWriter(data?.data?.content || "No response");
    }

    if(mode === "image"){
      result.innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if(mode === "video"){
      if(data.preview){
        result.innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${data.preview}"></video>
          </div>
        `;
      }else if(data.taskId){
        waitForVideo(data.taskId);
      }else{
        result.innerHTML = `<div class="card">Video unavailable</div>`;
      }
    }

    loadUserProfile();

  }catch(err){
    result.innerHTML = `
      <div class="card">
        Generation failed
      </div>
    `;
  }
};

/* =========================
   COOKIE
========================= */
function initCookieBanner(){
  const banner = el("cookieBanner");
  const btn = el("acceptCookies");

  if(!banner || !btn) return;

  if(localStorage.getItem("reelmind_cookie_accept")==="yes"){
    banner.style.display = "none";
    return;
  }

  btn.onclick = ()=>{
    localStorage.setItem("reelmind_cookie_accept","yes");
    banner.style.display = "none";
  };
}

/* =========================
   LOAD
========================= */
window.addEventListener("load",()=>{
  initCookieBanner();

  setTimeout(()=>{
    const welcome = el("welcomeCard");
    if(welcome){
      welcome.style.opacity = "0";
      setTimeout(()=>{
        welcome.style.display = "none";
      },700);
    }
  },5000);
});
