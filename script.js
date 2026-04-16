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
  appId: "1:731354245603:web:1db1952458a8473082d8d6",
  measurementId: "G-F23DP2G9MW"
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
  return el(id)?.value.trim() || "";
}

function showMessage(msg){
  alert(msg);
}

function setUserInfo(email, credits){
  if(el("userEmail")) el("userEmail").innerText = email;
  if(el("credits")) el("credits").innerText = credits;
}

/* =========================
   PAYMENT
========================= */
window.buyCredits = function(){
  window.open("https://ko-fi.com/articalneavy", "_blank");
};

window.buyPlan = function(plan){
  const links = {
    starter: "https://ko-fi.com/articalneavy",
    pro: "https://ko-fi.com/articalneavy",
    unlimited: "https://ko-fi.com/articalneavy"
  };

  window.open(links[plan], "_blank");
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
      data.credits || 0
    );

  }catch{
    setUserInfo("Guest",0);
  }
}

/* =========================
   AUTH FUNCTIONS
========================= */
window.emailRegister = async ()=>{
  const email = val("email");
  const password = val("password");

  if(!email || !password){
    return showMessage("Please enter email and password");
  }

  try{
    await createUserWithEmailAndPassword(auth,email,password);
    showMessage("Account created");

  }catch(err){

    if(err.code === "auth/email-already-in-use"){
      showMessage("Email already exists. Please login.");
    }else{
      showMessage(err.message);
    }
  }
};

window.emailLogin = async ()=>{
  try{
    await signInWithEmailAndPassword(
      auth,
      val("email"),
      val("password")
    );

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

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async user=>{
  if(user){
    userToken = await user.getIdToken();
    loadUserProfile();
  }else{
    userToken = null;
    setUserInfo("Guest Mode","∞");
  }
});

/* =========================
   TAB SWITCH
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".tab-section").forEach(section=>{
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");
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
      setTimeout(write,5);
    }
  }

  write();
}

/* =========================
   LOADING
========================= */
function showLoading(){
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `;
}

/* =========================
   VIDEO POLLING
========================= */
async function waitForVideo(taskId){
  for(let i=0;i<25;i++){

    await new Promise(r=>setTimeout(r,4000));

    const res = await fetch(`${API}/video-status/${taskId}`);
    const data = await res.json();

    if(data.video){
      el("result").innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${data.video}"></video>
        </div>
      `;
      loadUserProfile();
      return;
    }
  }

  el("result").innerHTML = `
    <div class="card">Video still processing...</div>
  `;
}

/* =========================
   GENERATE
========================= */
window.generateContent = async ()=>{
  const prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");

  if(!prompt){
    return showMessage("Enter a prompt");
  }

  showLoading();

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

    const data = await res.json();

    if(data.error){
      el("result").innerHTML = `
        <div class="card">${data.error}</div>
      `;
      return;
    }

    if(mode==="text"){
      typeWriter(data?.data?.content || "No response");
    }

    if(mode==="image"){
      el("result").innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if(mode==="video"){
      if(data.preview){
        el("result").innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${data.preview}"></video>
          </div>
        `;
      }else if(data.taskId){
        waitForVideo(data.taskId);
      }else{
        el("result").innerHTML = `
          <div class="card">Video unavailable</div>
        `;
      }
    }

    loadUserProfile();

  }catch{
    el("result").innerHTML = `
      <div class="card">Generation failed</div>
    `;
  }
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function(){
  localStorage.setItem("cookieAccepted","yes");
  if(el("cookieBanner")){
    el("cookieBanner").style.display = "none";
  }
};

/* =========================
   LOAD
========================= */
window.addEventListener("load",()=>{

  if(localStorage.getItem("cookieAccepted")==="yes"){
    if(el("cookieBanner")){
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(()=>{
    const splash = el("welcomeCard");
    if(splash){
      splash.style.opacity = "0";
      setTimeout(()=>{
        splash.style.display = "none";
      },700);
    }
  },3500);
});
