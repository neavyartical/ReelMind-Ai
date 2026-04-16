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
  return document.getElementById(id).value;
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
    alert("Login successful");
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
   USER STATE
========================= */
onAuthStateChanged(auth, async user=>{
  const label = document.getElementById("userEmail");

  if(user){
    userToken = await user.getIdToken();
    if(label) label.innerText = user.email;
  }else{
    userToken = null;
    if(label) label.innerText = "Guest Mode";
  }
});

/* =========================
   TAB SWITCH
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.remove("active");
  });

  const target = document.getElementById(tab);
  if(target) target.classList.add("active");
};

/* =========================
   TYPEWRITER
========================= */
function typeWriter(text){
  const result = document.getElementById("result");
  result.innerHTML = `<div class="card" id="typed"></div>`;

  let i = 0;
  const typed = document.getElementById("typed");

  function write(){
    if(i < text.length){
      typed.innerHTML += text.charAt(i);
      i++;
      setTimeout(write,8);
    }
  }

  write();
}

/* =========================
   VIDEO POLLING
========================= */
async function waitForVideo(taskId){
  const result = document.getElementById("result");

  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,5000));

    const res = await fetch(API + "/video-status/" + taskId);
    const data = await res.json();

    if(data?.video){
      result.innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${data.video}"></video>
        </div>
      `;
      return;
    }
  }

  result.innerHTML = `<div class="card">Video still processing.</div>`;
}

/* =========================
   GENERATE
========================= */
document.getElementById("generate").onclick = async ()=>{
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

  if(mode==="text"){
    typeWriter(data?.data?.content || "No response");
  }

  if(mode==="image"){
    result.innerHTML = `
      <div class="card">
        <img src="${data?.data?.url}">
      </div>
    `;
  }

  if(mode==="video"){
    if(data?.preview){
      result.innerHTML = `
        <div class="card">
          <video controls autoplay src="${data.preview}"></video>
        </div>
      `;
    }else if(data?.taskId){
      waitForVideo(data.taskId);
    }else{
      result.innerHTML = `<div class="card">Video unavailable.</div>`;
    }
  }
};

/* =========================
   COOKIE
========================= */
function initCookieBanner(){
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  if(!banner || !btn) return;

  if(localStorage.getItem("reelmind_cookie_accept")==="yes"){
    banner.style.display="none";
    return;
  }

  btn.onclick = ()=>{
    localStorage.setItem("reelmind_cookie_accept","yes");
    banner.style.display="none";
  };
}

/* =========================
   LOAD
========================= */
window.addEventListener("load",()=>{
  initCookieBanner();

  setTimeout(()=>{
    const welcome = document.getElementById("welcomeCard");
    if(welcome){
      welcome.style.opacity="0";
      setTimeout(()=>welcome.style.display="none",800);
    }
  },7000);
});
