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
  apiKey: "AIzaSyCz9rReG2zuaj0AGuafpTzpCUopuHMD_wQ",
  authDomain: "reelmind-ai-f07cb.firebaseapp.com",
  projectId: "reelmind-ai-f07cb",
  storageBucket: "reelmind-ai-f07cb.firebasestorage.app",
  messagingSenderId: "731354245603",
  appId: "1:731354245603:web:7861b1c97e70b19982d8d6",
  measurementId: "G-WGL2F08WC7"
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
  return el(id)?.value?.trim() || "";
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

    setUserInfo(
      data.email || "Guest",
      data.credits ?? 0
    );

  }catch{
    setUserInfo("Guest",0);
  }
}

/* =========================
   AUTH FUNCTIONS
========================= */
window.emailRegister = async ()=>{
  try{
    await createUserWithEmailAndPassword(auth,val("email"),val("password"));
    alert("Account created");
  }catch(err){
    alert(err.message);
  }
};

window.emailLogin = async ()=>{
  try{
    await signInWithEmailAndPassword(auth,val("email"),val("password"));
  }catch(err){
    alert(err.message);
  }
};

window.googleLogin = async ()=>{
  try{
    await signInWithPopup(auth,provider);
  }catch(err){
    alert(err.message);
  }
};

window.logout = async ()=>{
  await signOut(auth);
};

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async user=>{
  if(user){
    userToken = await user.getIdToken();
    await loadUserProfile();
  }else{
    userToken = null;
    setUserInfo("Guest Mode","∞");
  }
});

/* =========================
   TAB SWITCH
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(sec=>{
    sec.classList.remove("active");
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

  const target = el("typedText");
  let i = 0;

  function write(){
    if(i < text.length){
      target.innerHTML += text.charAt(i);
      i++;
      setTimeout(write,5);
    }
  }

  write();
}

/* =========================
   LOADING
========================= */
function showLoading(mode){
  const result = el("result");

  result.innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      <div id="loadingText">Preparing ${mode}...</div>
    </div>
  `;

  const steps = [
    "Analyzing prompt...",
    "Building output...",
    "Optimizing quality...",
    "Almost ready..."
  ];

  let i = 0;

  return setInterval(()=>{
    const txt = el("loadingText");
    if(txt){
      txt.innerText = steps[i % steps.length];
      i++;
    }
  },1500);
}

/* =========================
   VIDEO STATUS
========================= */
async function waitForVideo(taskId){
  const result = el("result");

  for(let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r,3000));

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

  result.innerHTML = `<div class="card">Video still processing...</div>`;
}

/* =========================
   GENERATE
========================= */
el("generate").onclick = async ()=>{
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const result = el("result");

  if(!prompt){
    alert("Please enter a prompt");
    return;
  }

  const loading = showLoading(mode);

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
      body:JSON.stringify({
        prompt,
        language
      })
    });

    clearInterval(loading);

    const data = await res.json();

    if(data.error){
      result.innerHTML = `<div class="card">${data.error}</div>`;
      return;
    }

    if(mode==="text"){
      typeWriter(data?.data?.content || "No response");
    }

    if(mode==="image"){
      result.innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated">
        </div>
      `;
    }

    if(mode==="video"){
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

  }catch{
    clearInterval(loading);
    result.innerHTML = `<div class="card">Generation failed</div>`;
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
});
