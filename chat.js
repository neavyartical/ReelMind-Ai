import { API, auth, socket, el } from "./script.js";

let activeChatUser = "demo-user";
let typingTimeout = null;

/* =========================
   USER ID
========================= */
function getCurrentUserId(){
  return auth?.currentUser?.uid || null;
}

/* =========================
   AUTO SCROLL
========================= */
function scrollMessages(){
  const list = el("messageList");
  if(list){
    list.scrollTop = list.scrollHeight;
  }
}

/* =========================
   CALL STATUS
========================= */
function setCallStatus(text=""){
  const status = el("callStatus");
  if(status){
    status.innerText = text;
  }
}

/* =========================
   LOAD MESSAGES
========================= */
window.loadMessages = async (targetUserId = activeChatUser)=>{
  try{
    activeChatUser = targetUserId;

    const sender = getCurrentUserId();
    if(!sender) return;

    const res = await fetch(`${API}/messages/${sender}/${targetUserId}`);
    const data = await res.json();

    const list = el("messageList");
    if(!list) return;

    list.innerHTML = "";

    (data.messages || []).forEach(msg=>{
      const mine = msg.sender === sender;

      const div = document.createElement("div");
      div.className = `message ${mine ? "sent" : "received"}`;
      div.textContent = msg.text || "";
      list.appendChild(div);
    });

    scrollMessages();
  }catch(error){
    console.log("loadMessages error:", error);
  }
};

/* =========================
   SEND MESSAGE
========================= */
window.sendMessage = async ()=>{
  const input = el("messageInput");
  const text = input?.value?.trim();
  const sender = getCurrentUserId();

  if(!text || !sender) return;

  try{
    await fetch(`${API}/messages/send`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        sender,
        receiver:activeChatUser,
        text
      })
    });

    socket.emit("send-message",{
      senderId:sender,
      receiverId:activeChatUser,
      text
    });

    input.value = "";
    loadMessages(activeChatUser);

  }catch(error){
    console.log("sendMessage error:", error);
  }
};

/* =========================
   TYPING STATUS
========================= */
function emitTyping(){
  const sender = getCurrentUserId();
  if(!sender) return;

  socket.emit("typing",{
    senderId:sender,
    receiverId:activeChatUser
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(()=>{
    socket.emit("stop-typing",{
      senderId:sender,
      receiverId:activeChatUser
    });
  },1000);
}

/* =========================
   START AUDIO CALL
========================= */
window.startCall = ()=>{
  const callerId = getCurrentUserId();
  if(!callerId) return;

  socket.emit("call-user",{
    callerId,
    receiverId:activeChatUser,
    callerName:auth.currentUser?.email || "User",
    type:"audio"
  });

  setCallStatus("Calling...");
};

/* =========================
   START VIDEO CALL
========================= */
window.startVideoCall = ()=>{
  const callerId = getCurrentUserId();
  if(!callerId) return;

  socket.emit("call-user",{
    callerId,
    receiverId:activeChatUser,
    callerName:auth.currentUser?.email || "User",
    type:"video"
  });

  setCallStatus("Video calling...");
};

/* =========================
   END CALL
========================= */
window.endCall = ()=>{
  const callerId = getCurrentUserId();

  socket.emit("end-call",{
    callerId,
    receiverId:activeChatUser
  });

  setCallStatus("Call ended");

  setTimeout(()=>{
    setCallStatus("");
  },2500);
};

/* =========================
   SOCKET EVENTS
========================= */
socket.on("receive-message",()=>{
  loadMessages(activeChatUser);
});

socket.on("user-typing",()=>{
  setCallStatus("Typing...");
});

socket.on("user-stop-typing",()=>{
  setCallStatus("");
});

socket.on("incoming-call",(data)=>{
  const accept = confirm(
    `${data.callerName} is calling you (${data.type}). Accept?`
  );

  if(accept){
    socket.emit("answer-call",{
      callerId:data.callerId,
      receiverId:getCurrentUserId(),
      answer:true
    });

    setCallStatus(`${data.type} call connected`);
  }else{
    socket.emit("reject-call",{
      callerId:data.callerId,
      receiverId:getCurrentUserId()
    });
  }
});

socket.on("call-answered",()=>{
  setCallStatus("Call connected");
});

socket.on("call-rejected",()=>{
  setCallStatus("Call rejected");
});

socket.on("call-ended",()=>{
  setCallStatus("Call ended");

  setTimeout(()=>{
    setCallStatus("");
  },2500);
});

/* =========================
   INPUT EVENTS
========================= */
window.addEventListener("load",()=>{
  const input = el("messageInput");

  if(input){
    input.addEventListener("keypress",(e)=>{
      if(e.key==="Enter"){
        e.preventDefault();
        window.sendMessage();
      }else{
        emitTyping();
      }
    });

    input.addEventListener("input",emitTyping);
  }
});
