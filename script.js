const API = "https://reelmindbackend-1.onrender.com";

function val(id){
  return document.getElementById(id).value;
}

window.switchTab = function(tab){
  document.querySelectorAll(".section").forEach(section=>{
    section.classList.remove("active");
  });
  document.getElementById(tab).classList.add("active");
};

window.emailLogin = function(){
  alert("Firebase login can be connected later");
};

window.emailRegister = function(){
  alert("Firebase register can be connected later");
};

window.googleLogin = function(){
  alert("Google login can be connected later");
};

window.logout = function(){
  alert("Logged out");
};

function typeWriter(text){
  const result = document.getElementById("result");
  result.innerHTML = `<div class="card" id="typed"></div>`;

  let i = 0;
  const target = document.getElementById("typed");

  function write(){
    if(i < text.length){
      target.innerHTML += text.charAt(i);
      i++;
      setTimeout(write, 8);
    }
  }

  write();
}

document.getElementById("generate").onclick = async function(){
  const prompt = val("prompt").trim();
  const mode = val("mode");
  const language = val("language");
  const result = document.getElementById("result");

  if(!prompt){
    return;
  }

  result.innerHTML = `<div class="card">⏳ Generating ${mode}...</div>`;

  try{
    let endpoint = "";

    if(mode === "text"){
      endpoint = "/generate-text";
    }

    if(mode === "image"){
      endpoint = "/generate-image";
    }

    if(mode === "video"){
      endpoint = "/generate-video";
    }

    const res = await fetch(API + endpoint,{
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

    console.log("API RESPONSE:", data);

    if(mode === "text"){
      const story =
        data?.data?.content ||
        data?.content ||
        JSON.stringify(data, null, 2);

      typeWriter(story);
    }

    if(mode === "image"){
      result.innerHTML = `
        <div class="card">
          <img src="${data?.data?.url}" alt="Generated image">
        </div>
      `;
    }

    if(mode === "video"){
      if(data?.preview){
        result.innerHTML = `
          <div class="card">
            <video controls autoplay src="${data.preview}"></video>
          </div>
        `;
      } else {
        result.innerHTML = `
          <div class="card">
            ${JSON.stringify(data, null, 2)}
          </div>
        `;
      }
    }

  }catch(error){
    console.error(error);

    result.innerHTML = `
      <div class="card">
        ❌ Generation failed
      </div>
    `;
  }
};

window.startMic = function(){
  const rec = new webkitSpeechRecognition();
  rec.lang = "en-US";

  rec.onresult = function(e){
    document.getElementById("prompt").value =
      e.results[0][0].transcript;
  };

  rec.start();
};

window.addEventListener("load", ()=>{
  setTimeout(()=>{
    const splash = document.getElementById("startupLogo");
    if(splash){
      splash.style.display = "none";
    }
  }, 4000);
});
