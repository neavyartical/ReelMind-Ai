const API = "https://reelmindbackend-1.onrender.com";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let token = null;

function val(id){
  return document.getElementById(id).value;
}

window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.remove("active");
  });
  document.getElementById(tab).classList.add("active");
};

window.emailLogin = function(){
  signInWithEmailAndPassword(auth,val("email"),val("password"))
    .catch(err=>alert(err.message));
};

window.emailRegister = function(){
  createUserWithEmailAndPassword(auth,val("email"),val("password"))
    .catch(err=>alert(err.message));
};

window.googleLogin = function(){
  signInWithPopup(auth,provider)
    .catch(err=>alert(err.message));
};

window.logout = function(){
  signOut(auth);
};

onAuthStateChanged(auth, async(user)=>{
  if(user){
    token = await user.getIdToken();
    document.getElementById("userEmail").innerText = user.email;
  }else{
    token = null;
    document.getElementById("userEmail").innerText = "Guest Mode";
  }
});

function typeWriter(text){
  const result = document.getElementById("result");
  result.innerHTML = '<div class="card" id="typed"></div>';

  let i = 0;
  const el = document.getElementById("typed");

  function write(){
    if(i < text.length){
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(write,8);
    }
  }

  write();
}

document.getElementById("generate").onclick = async ()=>{
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = document.getElementById("result");

  if(!prompt) return;

  result.innerHTML = `
    <div class="card">
      <div class="loader"></div>
      <p style="text-align:center;">Creating your content...</p>
    </div>
  `;

  try{
    const headers = {
      "Content-Type":"application/json"
    };

    if(token){
      headers.Authorization = "Bearer " + token;
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
      result.innerHTML = `<div class="card"><img src="${data?.data?.url}"></div>`;
    }

    if(mode==="video"){
      if(data?.preview){
        result.innerHTML = `<div class="card"><video controls src="${data.preview}"></video></div>`;
      }else{
        result.innerHTML = "<div class='card'>⚠️ Video unavailable</div>";
      }
    }

  }catch{
    result.innerHTML = "<div class='card'>❌ Generation failed</div>";
  }
};

window.startMic = function(){
  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";
  rec.onresult = e=>{
    document.getElementById("prompt").value = e.results[0][0].transcript;
  };
  rec.start();
};

window.addEventListener("load", ()=>{
  setTimeout(()=>{
    const card = document.getElementById("welcomeCard");
    if(card) card.style.display = "none";
  },7000);

  const banner = document.getElementById("cookieBanner");
  const accepted = localStorage.getItem("cookiesAccepted");

  if(accepted){
    banner.style.display = "none";
  }

  document.getElementById("acceptCookies").onclick = ()=>{
    localStorage.setItem("cookiesAccepted","yes");
    banner.style.display = "none";
  };
});
