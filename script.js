export const API = "https://reelmindbackend-1.onrender.com";

/* =========================
   ELEMENT HELPER
========================= */
export function el(id){
  return document.getElementById(id);
}

/* =========================
   SAFE TAB SWITCHER
========================= */
window.switchTab = function(tabId){
  document.querySelectorAll(".tab-section").forEach(section=>{
    section.style.display="none";
    section.classList.remove("active");
  });

  const target = el(tabId);

  if(target){
    target.style.display="block";
    target.classList.add("active");
  }

  if(tabId==="feed" && window.loadFeed){
    window.loadFeed();
  }

  if(tabId==="messages" && window.loadMessages){
    window.loadMessages();
  }
};

/* =========================
   COOKIE
========================= */
window.acceptCookies = function(){
  localStorage.setItem("cookieAccepted","yes");
  el("cookieBanner")?.remove();
};

/* =========================
   THEME
========================= */
window.toggleTheme = function(){
  document.body.classList.toggle("light-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light-mode") ? "light" : "dark"
  );
};

/* =========================
   NOTIFICATIONS
========================= */
window.toggleNotifications = function(){
  alert("Notifications updated");
};

/* =========================
   PROFILE EDIT
========================= */
window.editProfile = function(){
  const currentName = el("profileName")?.innerText || "";
  const newName = prompt("Enter new profile name:", currentName);

  if(newName && el("profileName")){
    el("profileName").innerText = newName;
    localStorage.setItem("profileName", newName);
  }
};

window.changePhoto = function(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = ()=>{
    const file = input.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = e=>{
      const image = e.target.result;
      if(el("profileAvatar")){
        el("profileAvatar").src = image;
      }
      localStorage.setItem("profileAvatar", image);
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* =========================
   ACCOUNT
========================= */
window.logoutUser = function(){
  alert("Logout feature ready for backend connection");
};

window.clearAppCache = function(){
  localStorage.clear();
  alert("Cache cleared");
  location.reload();
};

window.deleteAccount = function(){
  const confirmDelete = confirm("Delete account permanently?");
  if(confirmDelete){
    alert("Delete account backend integration required");
  }
};

/* =========================
   CALLS
========================= */
window.startCall = function(){
  const status = el("callStatus");
  if(status){
    status.innerText = "Starting audio call...";
    setTimeout(()=>status.innerText="",3000);
  }
};

window.startVideoCall = function(){
  const status = el("callStatus");
  if(status){
    status.innerText = "Starting video call...";
    setTimeout(()=>status.innerText="",3000);
  }
};

/* =========================
   UPLOAD BUTTON
========================= */
window.openUpload = function(){
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,video/*";

  input.onchange = ()=>{
    const file = input.files[0];
    if(!file) return;

    alert("Selected: " + file.name);
    window.switchTab("create");
  };

  input.click();
};

/* =========================
   RESTORE PROFILE
========================= */
function restoreProfile(){
  const savedName = localStorage.getItem("profileName");
  const savedAvatar = localStorage.getItem("profileAvatar");
  const savedTheme = localStorage.getItem("theme");

  if(savedName && el("profileName")){
    el("profileName").innerText = savedName;
  }

  if(savedAvatar && el("profileAvatar")){
    el("profileAvatar").src = savedAvatar;
  }

  if(savedTheme==="light"){
    document.body.classList.add("light-mode");
  }
}

/* =========================
   START APP
========================= */
window.addEventListener("load", async ()=>{

  setTimeout(()=>{
    el("welcomeCard")?.remove();
  },1200);

  if(localStorage.getItem("cookieAccepted")==="yes"){
    el("cookieBanner")?.remove();
  }

  restoreProfile();

  try{ await import("./feed.js"); }catch(e){ console.log(e); }
  try{ await import("./ai.js"); }catch(e){ console.log(e); }
  try{ await import("./chat.js"); }catch(e){ console.log(e); }
  try{ await import("./settings.js"); }catch(e){ console.log(e); }

  window.switchTab("feed");

  el("cookieAcceptBtn")?.addEventListener("click", window.acceptCookies);
  el("generateBtn")?.addEventListener("click", ()=>window.generateContent?.());
  el("sendBtn")?.addEventListener("click", ()=>window.sendMessage?.());
  el("voiceBtn")?.addEventListener("click", ()=>window.startVoiceInput?.());
  el("downloadBtn")?.addEventListener("click", ()=>window.downloadResult?.());
  el("uploadBtn")?.addEventListener("click", window.openUpload);
  el("audioCallBtn")?.addEventListener("click", window.startCall);
  el("videoCallBtn")?.addEventListener("click", window.startVideoCall);
});
