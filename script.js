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
function val(id){
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setUserInfo(email, credits){
  const emailEl = document.getElementById("userEmail");
  const creditsEl = document.getElementById("credits");
  const buyBtn = document.getElementById("buyCreditsBtn");

  if(emailEl) emailEl.innerText = email;
  if(creditsEl) creditsEl.innerText = credits;

  if(buyBtn){
    if(typeof credits === "number" && credits <= 10){
      buyBtn.style.display = "block";
    }else{
      buyBtn.style.display = "none";
    }
  }
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
    const res = await fetch(API + "/me", {
      headers:{
        Authorization:"Bearer " + userToken
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
   AUTH
========================= */
window.emailRegister = async function(){
  try{
    await createUserWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );
    alert("Account created");
  }catch(err){
    alert(err.message);
  }
};

window.emailLogin = async function(){
  try{
    await signInWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );
  }catch(err){
    alert(err.message);
  }
};

window.googleLogin = async function(){
  try{
    await signInWithPopup(auth, provider);
  }catch(err){
    alert(err.message);
  }
};

window.logout = async function(){
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
   TABS
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(section=>{
    section.classList.remove("active");
  });

  const target = document.getElementById(tab);
  if(target){
    target.classList.add("active");
  }
};

/* =========================
   TYPEWRITER
========================= */
function typeWriter(text){
  const result = document.getElementById("result");
  result.innerHTML = `<div class="card" id="typed"></div>`;

  const typed = document.getElementById("typed");
  let i = 0;

  function write(){
    if(i < text.length){
      typed.innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 8);
    }
  }

  write();
}

/* =========================
   VIDEO WAIT
========================= */
async function waitForVideo(taskId){
  const result = document.getElementById("result");

  for(let i=0;i<30;i++){
    await new Promise(resolve => setTimeout(resolve,5000));

    const res = await fetch(API + "/video-status/" + taskId);
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
document.getElementById("generate").onclick = async ()=>{
  switchTab("create");

  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = document.getElementById("result");

  if(!prompt) return;

  result.innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `;

  try{
    const headers = {
      "Content-Type":"application/json"
    };

    if(userToken){
      headers.Authorization = "Bearer " + userToken;
    }

    const res = await fetch(API + "/generate-" + mode,{
      method:"POST",
      headers,
      body:JSON.stringify({
        prompt,
        language
      })
    });

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

  }catch{
    result.innerHTML = `<div class="card">Generation failed</div>`;
  }
};

/* =========================
   COOKIE
========================= */
function initCookieBanner(){
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  if(!banner || !btn) return;

  if(localStorage.getItem("reelmind_cookie_accept") === "yes"){
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
window.addEventListener("load", ()=>{
  initCookieBanner();

  setTimeout(()=>{
    const card = document.getElementById("welcomeCard");
    if(card){
      card.style.opacity = "0";
      setTimeout(()=>{
        card.style.display = "none";
      },800);
    }
  },7000);
});
