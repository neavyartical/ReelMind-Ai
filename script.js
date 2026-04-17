const API = "https://reelmindbackend-1.onrender.com";
const ADMIN_EMAIL = "neavyartical@gmail.com";

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
let latestDownloadUrl = "";
let uploadedFile = null;
let generating = false;

/* =========================
   HELPERS
========================= */
function el(id){
  return document.getElementById(id);
}

function val(id){
  return el(id)?.value?.trim() || "";
}

function showMessage(message){
  alert(message);
}

function setLoading(){
  el("result").innerHTML = `
    <div class="card">
      <div class="spinner"></div>
      Generating...
    </div>
  `;
}

function renderImage(url){
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <img src="${latestDownloadUrl}" alt="Generated image">
    </div>
  `;
}

function renderVideo(url){
  latestDownloadUrl = url || "";
  el("result").innerHTML = `
    <div class="card">
      <video controls src="${latestDownloadUrl}"></video>
    </div>
  `;
}

function renderText(text){
  latestDownloadUrl = "";
  el("result").innerHTML = `
    <div class="card">
      ${text || "No response"}
    </div>
  `;
}

/* =========================
   PROMPT ENHANCER
========================= */
function enhancePrompt(prompt, mode){
  let clean = prompt.trim();

  clean = clean.replace(/reelmind/gi, "ReelMind");

  if(mode === "image"){
    clean += ", ultra detailed, premium design, sharp focus, realistic lighting, accurate text spelling, professional branding, world-class logo design";
  }

  if(mode === "video"){
    clean += ", cinematic motion, smooth camera movement, professional film lighting, ultra realistic";
  }

  if(mode === "text"){
    clean += ". Write with correct spelling, professionalism and immersive detail.";
  }

  return clean;
}

/* =========================
   SPLASH
========================= */
window.addEventListener("load", ()=>{
  if(localStorage.getItem("cookieAccepted") === "yes"){
    if(el("cookieBanner")){
      el("cookieBanner").style.display = "none";
    }
  }

  setTimeout(()=>{
    const splash = el("welcomeCard");

    if(splash){
      splash.style.opacity = "0";
      splash.style.pointerEvents = "none";

      setTimeout(()=>{
        splash.remove();
      },700);
    }
  },1800);
});

/* =========================
   AUTH
========================= */
window.emailRegister = async ()=>{
  try{
    await createUserWithEmailAndPassword(auth, val("email"), val("password"));
    showMessage("Account created successfully");
  }catch(error){
    showMessage(error.message);
  }
};

window.emailLogin = async ()=>{
  try{
    await signInWithEmailAndPassword(auth, val("email"), val("password"));
  }catch(error){
    showMessage(error.message);
  }
};

window.googleLogin = async ()=>{
  try{
    await signInWithPopup(auth, provider);
  }catch(error){
    showMessage(error.message);
  }
};

window.logout = async ()=>{
  await signOut(auth);
};

onAuthStateChanged(auth, async(user)=>{
  if(user){
    userToken = await user.getIdToken();
    if(el("userEmail")) el("userEmail").innerText = user.email;
  }else{
    userToken = null;
    if(el("userEmail")) el("userEmail").innerText = "";
  }
});

/* =========================
   PAYMENTS
========================= */
window.buyCredits = ()=>{
  window.open("https://ko-fi.com/articalneavy","_blank");
};

window.buyPlan = ()=>{
  window.open("https://ko-fi.com/articalneavy","_blank");
};

/* =========================
   VOICE INPUT
========================= */
window.startVoiceInput = ()=>{
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    return showMessage("Voice recognition not supported");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event)=>{
    el("prompt").value = event.results[0][0].transcript;
  };

  recognition.onerror = ()=>{
    showMessage("Voice input failed");
  };
};

/* =========================
   MEDIA UPLOAD
========================= */
window.uploadMedia = ()=>{
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = (event)=>{
    const file = event.target.files[0];
    if(!file) return;

    uploadedFile = file;

    const reader = new FileReader();

    reader.onload = (e)=>{
      latestDownloadUrl = e.target.result;

      if(file.type.startsWith("video")){
        renderVideo(latestDownloadUrl);
      }else{
        el("result").innerHTML = `
          <div class="card">
            <img src="${latestDownloadUrl}">
            <p style="margin-top:12px;color:#00d9ff;">
              Image uploaded — describe your edit and tap Generate
            </p>
          </div>
        `;
      }
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* =========================
   DOWNLOAD
========================= */
window.downloadResult = ()=>{
  if(!latestDownloadUrl){
    return showMessage("Nothing to download");
  }

  const a = document.createElement("a");
  a.href = latestDownloadUrl;
  a.download = "reelmind-result";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* =========================
   GENERATE
========================= */
window.generateContent = async ()=>{
  if(generating){
    return showMessage("Please wait for current generation to finish.");
  }

  let prompt = val("prompt");
  const mode = val("mode");
  const language = val("language");
  const location = val("location");

  if(!prompt){
    return showMessage("Enter a prompt first");
  }

  generating = true;
  prompt = enhancePrompt(prompt, mode);
  setLoading();

  try{
    let response;

    if(uploadedFile && mode === "image"){
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("prompt", prompt);
      formData.append("language", language);
      formData.append("location", location);

      response = await fetch(`${API}/edit-image`, {
        method: "POST",
        headers: {
          Authorization: userToken ? `Bearer ${userToken}` : ""
        },
        body: formData
      });

    }else{
      response = await fetch(`${API}/generate-${mode}`, {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          Authorization: userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({
          prompt,
          language,
          location
        })
      });
    }

    const data = await response.json();

    if(mode === "text"){
      renderText(data?.data?.content);
    }

    if(mode === "image"){
      renderImage(data?.data?.url || data?.url);
    }

    if(mode === "video"){
      renderVideo(data?.preview || data?.video);
    }

    uploadedFile = null;

  }catch(error){
    console.error(error);

    el("result").innerHTML = `
      <div class="card">
        Generation failed. Please try again.
      </div>
    `;
  }

  generating = false;
};

/* =========================
   TABS
========================= */
window.switchTab = (tab)=>{
  document.querySelectorAll(".tab-section").forEach(section=>{
    section.classList.remove("active");
  });

  el(tab)?.classList.add("active");
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = ()=>{
  localStorage.setItem("cookieAccepted","yes");

  if(el("cookieBanner")){
    el("cookieBanner").style.display = "none";
  }
};
