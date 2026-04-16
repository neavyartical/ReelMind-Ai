const API = "https://reelmindbackend-1.onrender.com";

function val(id){
  return document.getElementById(id).value;
}

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.remove("active");
  });

  const selected = document.getElementById(tab);
  if(selected) selected.classList.add("active");
};

/* =========================
   AUTH PLACEHOLDERS
========================= */
window.emailLogin = ()=> alert("Login coming soon");
window.emailRegister = ()=> alert("Register coming soon");
window.googleLogin = ()=> alert("Google login coming soon");
window.logout = ()=> alert("Logged out");

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
   WAIT FOR VIDEO
========================= */
async function waitForVideo(taskId){
  const result = document.getElementById("result");

  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,5000));

    try{
      const res = await fetch(API + "/video-status/" + taskId);
      const data = await res.json();

      const videoUrl =
        data?.video ||
        data?.url ||
        data?.preview ||
        data?.output?.[0] ||
        "";

      if(videoUrl){
        result.innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${videoUrl}"></video>
          </div>
        `;
        return;
      }

    }catch(e){}
  }

  result.innerHTML = `
    <div class="card">
      Video is still processing. Please try again later.
    </div>
  `;
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
      Generating your masterpiece...
    </div>
  `;

  try{
    const res = await fetch(API + "/generate-" + mode,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        prompt,
        language
      })
    });

    const data = await res.json();

    if(mode==="text"){
      const story =
        data?.data?.content ||
        data?.content ||
        data?.story ||
        data?.result ||
        "No response";
      typeWriter(story);
    }

    if(mode==="image"){
      const imageUrl =
        data?.data?.url ||
        data?.url ||
        data?.image ||
        "";

      result.innerHTML = imageUrl
        ? `<div class="card"><img src="${imageUrl}"></div>`
        : `<div class="card">No image returned.</div>`;
    }

    if(mode==="video"){
      const instantVideo =
        data?.video ||
        data?.url ||
        data?.preview ||
        "";

      const taskId =
        data?.taskId ||
        data?.id ||
        data?.task_id;

      if(instantVideo){
        result.innerHTML = `
          <div class="card">
            <video controls autoplay playsinline src="${instantVideo}"></video>
          </div>
        `;
      } else if(taskId){
        result.innerHTML = `
          <div class="card">
            <div class="spinner"></div>
            Finalizing your cinematic video...
          </div>
        `;
        waitForVideo(taskId);
      } else {
        result.innerHTML = `
          <div class="card">
            Video unavailable.
          </div>
        `;
      }
    }

  }catch(error){
    result.innerHTML = `
      <div class="card">
        ❌ Generation failed.
      </div>
    `;
  }
};

/* =========================
   VOICE INPUT
========================= */
window.startMic = function(){
  if(!window.webkitSpeechRecognition){
    alert("Voice not supported.");
    return;
  }

  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";

  rec.onresult = e=>{
    document.getElementById("prompt").value =
      e.results[0][0].transcript;
  };

  rec.start();
};

/* =========================
   COOKIE
========================= */
function initCookieBanner(){
  const banner = document.getElementById("cookieBanner");
  const btn = document.getElementById("acceptCookies");

  if(!banner || !btn) return;

  const saved = localStorage.getItem("reelmind_cookie_accept");

  if(saved==="yes"){
    banner.style.display="none";
    return;
  }

  btn.onclick = ()=>{
    localStorage.setItem("reelmind_cookie_accept","yes");
    banner.style.opacity="0";

    setTimeout(()=>{
      banner.style.display="none";
    },500);
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

      setTimeout(()=>{
        welcome.style.display="none";
      },800);
    }
  },7000);
});
