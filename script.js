const API = "https://reelmindbackend-1.onrender.com";

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
  alert("Login connected to Firebase later");
};

window.emailRegister = function(){
  alert("Register connected to Firebase later");
};

window.googleLogin = function(){
  alert("Google login connected later");
};

window.logout = function(){
  alert("Logged out");
};

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

  result.innerHTML = "<div class='card'>Generating...</div>";

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
      typeWriter(data?.data?.content || "No response");
    }

    if(mode==="image"){
      result.innerHTML = `<div class="card"><img src="${data?.data?.url}"></div>`;
    }

    if(mode==="video"){
      if(data?.preview){
        result.innerHTML = `<div class="card"><video controls src="${data.preview}"></video></div>`;
      }else{
        result.innerHTML = "<div class='card'>⚠️ Video generation unavailable</div>";
      }
    }

  }catch(error){
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
  },8000);

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
