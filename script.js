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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
   AUTH
========================= */
window.emailRegister = async ()=>{
  const email = val("email");
  const password = val("password");

  if(!email || !password){
    showMessage("Please enter email and password");
    return;
  }

  try{
    await createUserWithEmailAndPassword(auth,email,password);
    showMessage("Account created successfully");

  }catch(err){
    if(err.code === "auth/email-already-in-use"){
      showMessage("Email already exists. Please login instead.");
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
    showMessage("Login successful");
  }catch(err){
    showMessage(err.message);
  }
};

window.googleLogin = async ()=>{
  try{
    await signInWithPopup(auth, provider);
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
    loadUserProfile();
  }else{
    userToken = null;
    setUserInfo("Guest Mode","∞");
  }
});

/* =========================
   BUY CREDITS
========================= */
window.buyCredits = ()=>{
  window.open("https://ko-fi.com/articalneavy","_blank");
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
  localStorage.setItem("cookieAccepted","yes");
  if(el("cookieBanner")){
    el("cookieBanner").style.display = "none";
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
      setTimeout(write, 5);
    }
  }

  write();
}

/* =========================
   GENERATE
========================= */
window.generateContent = async ()=>{
  const prompt = val("prompt");
  const mode = val("mode");
  const result = el("result");

  if(!prompt){
    showMessage("Enter a prompt");
    return;
  }

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
      headers.Authorization = `Bearer ${userToken}`;
    }

    const res = await fetch(`${API}/generate-${mode}`,{
      method:"POST",
      headers,
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if(data.error){
      result.innerHTML = `<div class="card">${data.error}</div>`;
      return;
    }

    if(mode === "text"){
      typeWriter(data?.data?.content || "No output");
    }

    if(mode === "image"){
      result.innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if(mode === "video"){
      result.innerHTML = `
        <div class="card">
          <video controls autoplay playsinline src="${data?.preview}"></video>
        </div>
      `;
    }

    loadUserProfile();

  }catch{
    result.innerHTML = `
      <div class="card">
        Generation failed
      </div>
    `;
  }
};

/* =========================
   ON LOAD
========================= */
window.addEventListener("load",()=>{
  if(localStorage.getItem("cookieAccepted")==="yes"){
    if(el("cookieBanner")){
      el("cookieBanner").style.display = "none";
    }
  }
});
