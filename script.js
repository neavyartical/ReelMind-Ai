const API = "https://reelmindbackend-1.onrender.com";

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
  appId: "YOUR_APP_ID"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

let userToken = null;

function val(id){
  return document.getElementById(id).value;
}

async function loadCredits(){
  if(!userToken) return;

  const res = await fetch(API + "/me", {
    headers:{
      Authorization:"Bearer " + userToken
    }
  });

  const data = await res.json();

  document.getElementById("credits").innerText = data?.credits ?? 0;
}

window.emailRegister = async ()=>{
  await createUserWithEmailAndPassword(auth, val("email"), val("password"));
};

window.emailLogin = async ()=>{
  await signInWithEmailAndPassword(auth, val("email"), val("password"));
};

window.googleLogin = async ()=>{
  await signInWithPopup(auth, provider);
};

window.logout = async ()=>{
  await signOut(auth);
};

onAuthStateChanged(auth, async user=>{
  const label = document.getElementById("userEmail");

  if(user){
    userToken = await user.getIdToken();
    label.innerText = user.email;
    loadCredits();
  }else{
    userToken = null;
    label.innerText = "Guest Mode";
    document.getElementById("credits").innerText = "0";
  }
});

window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
};

function typeWriter(text){
  const result = document.getElementById("result");
  result.innerHTML = `<div class="card" id="typed"></div>`;
  let i=0;
  const el=document.getElementById("typed");

  function write(){
    if(i<text.length){
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(write,8);
    }
  }
  write();
}

async function waitForVideo(taskId){
  const result = document.getElementById("result");

  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,5000));

    const res = await fetch(API + "/video-status/" + taskId);
    const data = await res.json();

    if(data?.video){
      result.innerHTML = `<div class="card"><video controls autoplay src="${data.video}"></video></div>`;
      loadCredits();
      return;
    }
  }

  result.innerHTML = `<div class="card">Video still processing.</div>`;
}

document.getElementById("generate").onclick = async ()=>{
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = document.getElementById("result");

  if(!prompt) return;

  result.innerHTML = `<div class="card"><div class="spinner"></div>Generating...</div>`;

  const headers = {
    "Content-Type":"application/json"
  };

  if(userToken){
    headers.Authorization = "Bearer " + userToken;
  }

  const res = await fetch(API + "/generate-" + mode,{
    method:"POST",
    headers,
    body:JSON.stringify({prompt,language})
  });

  const data = await res.json();

  if(data?.error){
    result.innerHTML = `<div class="card">${data.error}</div>`;
    return;
  }

  if(mode==="text"){
    typeWriter(data?.data?.content || "No response");
    loadCredits();
  }

  if(mode==="image"){
    result.innerHTML = `<div class="card"><img src="${data?.data?.url}"></div>`;
    loadCredits();
  }

  if(mode==="video"){
    if(data?.preview){
      result.innerHTML = `<div class="card"><video controls autoplay src="${data.preview}"></video></div>`;
      loadCredits();
    }else if(data?.taskId){
      waitForVideo(data.taskId);
    }else{
      result.innerHTML = `<div class="card">Video unavailable.</div>`;
    }
  }
};

function initCookieBanner(){
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  if(localStorage.getItem("reelmind_cookie_accept")==="yes"){
    banner.style.display="none";
    return;
  }

  btn.onclick=()=>{
    localStorage.setItem("reelmind_cookie_accept","yes");
    banner.style.display="none";
  };
}

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
