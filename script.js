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
function getEl(id){
  return document.getElementById(id);
}

function val(id){
  return getEl(id)?.value || "";
}

function setUserInfo(email, credits){
  const emailEl = getEl("userEmail");
  const creditsEl = getEl("credits");
  const buyBtn = getEl("buyCreditsBtn");

  if(emailEl) emailEl.innerText = email;
  if(creditsEl) creditsEl.innerText = credits;

  if(buyBtn){
    if(credits === "∞" || Number(credits) > 10){
      buyBtn.style.display = "none";
    }else{
      buyBtn.style.display = "block";
    }
  }
}

function showResult(html){
  const result = getEl("result");
  if(result){
    result.innerHTML = html;
  }
}

function showLoading(){
  showResult(`
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `);
}

/* =========================
   BUY CREDITS
========================= */
window.buyCredits = function(){
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

/* =========================
   LOAD USER PROFILE
========================= */
async function loadUserProfile(){
  if(!userToken) return;

  try{
    const res = await fetch(API + "/me", {
      headers:{
        Authorization: "Bearer " + userToken
      }
    });

    const data = await res.json();

    setUserInfo(
      data.email || "Guest",
      data.credits ?? 0
    );

  }catch{
    setUserInfo("Guest", 0);
  }
}

/* =========================
   AUTH FUNCTIONS
========================= */
window.emailRegister = async function(){
  try{
    await createUserWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );
    alert("Account created successfully");
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
onAuthStateChanged(auth, async(user)=>{
  if(user){
    userToken = await user.getIdToken();
    await loadUserProfile();
  }else{
    userToken = null;
    setUserInfo("Guest Mode", "∞");
  }
});

/* =========================
   TAB SWITCH
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(section=>{
    section.classList.remove("active");
  });

  const target = getEl(tab);
  if(target){
    target.classList.add("active");
  }
};

/* =========================
   TYPEWRITER
========================= */
function typeWriter(text){
  showResult(`<div class="card" id="typed"></div>`);

  const el = getEl("typed");
  let i = 0;

  function write(){
    if(i < text.length){
      el.innerHTML += text.charAt(i);
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
  for(let i=0;i<30;i++){
    await new Promise(resolve=>setTimeout(resolve,5000));

    try{
      const res = await fetch(API + "/video-status/" + taskId);
      const data = await res.json();

      if(data.video){
        showResult(`
          <div class="card">
            <video controls autoplay playsinline src="${data.video}"></video>
          </div>
        `);

        loadUserProfile();
        return;
      }
    }catch{}
  }

  showResult(`<div class="card">Video is still processing...</div>`);
}

/* =========================
   GENERATE
========================= */
async function generateContent(){
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");

  if(!prompt) return;

  showLoading();

  try{
    const headers = {
      "Content-Type":"application/json"
    };

    if(userToken){
      headers.Authorization = "Bearer " + userToken;
    }

    const res = await fetch(`${API}/generate-${mode}`, {
      method:"POST",
      headers,
      body:JSON.stringify({
        prompt,
        language
      })
    });

    const data = await res.json();

    if(data.error){
      showResult(`<div class="card">${data.error}</div>`);
      return;
    }

    if(mode === "text"){
      typeWriter(data?.data?.content || "No response");
    }

    if(mode === "image"){
      showResult(`
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `);
    }

    if(mode === "video"){
      if(data.preview){
        showResult(`
          <div class="card">
            <video controls autoplay playsinline src="${data.preview}"></video>
          </div>
        `);
      }else if(data.taskId){
        waitForVideo(data.taskId);
      }else{
        showResult(`<div class="card">Video unavailable</div>`);
      }
    }

    loadUserProfile();

  }catch{
    showResult(`<div class="card">Generation failed</div>`);
  }
}

/* =========================
   VOICE PLACEHOLDER
========================= */
window.startMic = function(){
  alert("Voice input coming soon");
};

/* =========================
   COOKIE BANNER
========================= */
function initCookieBanner(){
  const banner = getEl("cookieBanner");
  const button = getEl("acceptCookies");

  if(!banner || !button) return;

  if(localStorage.getItem("reelmind_cookie_accept") === "yes"){
    banner.style.display = "none";
    return;
  }

  button.onclick = ()=>{
    localStorage.setItem("reelmind_cookie_accept", "yes");
    banner.style.display = "none";
  };
}

/* =========================
   PAGE LOAD
========================= */
window.addEventListener("load", ()=>{
  initCookieBanner();

  const generateBtn = getEl("generate");
  if(generateBtn){
    generateBtn.addEventListener("click", generateContent);
  }

  setTimeout(()=>{
    const welcomeCard = getEl("welcomeCard");
    if(welcomeCard){
      welcomeCard.style.opacity = "0";
      setTimeout(()=>{
        welcomeCard.style.display = "none";
      }, 800);
    }
  }, 6000);
});
