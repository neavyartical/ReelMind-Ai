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
  return el(id)?.value || "";
}

function setUserInfo(email, credits){
  if(el("userEmail")) el("userEmail").textContent = email;
  if(el("credits")) el("credits").textContent = credits;
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
    const res = await fetch(`${API}/me`, {
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
    setUserInfo("Guest", 0);
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
onAuthStateChanged(auth, async (user)=>{
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
      target.textContent += text.charAt(i);
      i++;
      setTimeout(write, 5);
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
      <p id="loadingText">Generating ${mode}...</p>
    </div>
  `;
}

/* =========================
   WAIT FOR VIDEO
========================= */
async function waitForVideo(taskId){
  for(let i=0;i<20;i++){
    await new Promise(r=>setTimeout(r,3000));

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
el("generate").onclick = async function(){
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");

  if(!prompt){
    alert("Please enter prompt");
    return;
  }

  showLoading(mode);

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

    const data = await res.json();

    if(data.error){
      el("result").innerHTML = `<div class="card">${data.error}</div>`;
      return;
    }

    if(mode === "text"){
      typeWriter(data?.data?.content || "No response");
    }

    if(mode === "image"){
      el("result").innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if(mode === "video"){
      if(data.preview){
        el("result").innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${data.preview}"></video>
          </div>
        `;
      }else if(data.taskId){
        waitForVideo(data.taskId);
      }
    }

    loadUserProfile();

  }catch{
    el("result").innerHTML = `
      <div class="card">Generation failed</div>
    `;
  }
};
