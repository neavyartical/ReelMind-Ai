import { API, auth, socket, el } from "./script.js";

let activeChatUser = "demo-user";
let localStream = null;

/* =========================
   USER ID
========================= */
function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

/* =========================
   LOAD MESSAGES
========================= */
window.loadMessages = async (targetUserId = activeChatUser) => {
  try {
    activeChatUser = targetUserId;

    const sender = getCurrentUserId();
    if (!sender) return;

    const res = await fetch(`${API}/messages/${sender}/${targetUserId}`);
    const data = await res.json();

    const list = el("messageList");
    if (!list) return;

    list.innerHTML = "";

    (data.messages || []).forEach(msg => {
      const mine = msg.sender === sender;

      list.innerHTML += `
        <div class="message ${mine ? "sent" : "received"}">
          ${msg.text}
        </div>
      `;
    });

    list.scrollTop = list.scrollHeight;
  } catch (error) {
    console.log(error);
  }
};

/* =========================
   SEND MESSAGE
========================= */
window.sendMessage = async () => {
  const input = el("messageInput");
  const text = input?.value?.trim();
  const sender = getCurrentUserId();

  if (!text || !sender) return;

  await fetch(`${API}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender,
      receiver: activeChatUser,
      text
    })
  });

  socket.emit("send-message", {
    senderId: sender,
    receiverId: activeChatUser,
    text
  });

  input.value = "";
  loadMessages(activeChatUser);
};

/* =========================
   START AUDIO CALL
========================= */
window.startCall = async () => {
  const callerId = getCurrentUserId();
  if (!callerId) return;

  socket.emit("call-user", {
    callerId,
    receiverId: activeChatUser,
    callerName: auth.currentUser?.email || "User",
    type: "audio"
  });

  if (el("callStatus")) {
    el("callStatus").innerText = "Calling...";
  }
};

/* =========================
   START VIDEO CALL
========================= */
window.startVideoCall = async () => {
  const callerId = getCurrentUserId();
  if (!callerId) return;

  socket.emit("call-user", {
    callerId,
    receiverId: activeChatUser,
    callerName: auth.currentUser?.email || "User",
    type: "video"
  });

  if (el("callStatus")) {
    el("callStatus").innerText = "Video calling...";
  }
};

/* =========================
   END CALL
========================= */
window.endCall = () => {
  const callerId = getCurrentUserId();

  socket.emit("end-call", {
    callerId,
    receiverId: activeChatUser
  });

  if (el("callStatus")) {
    el("callStatus").innerText = "Call ended";
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
};

/* =========================
   SOCKET EVENTS
========================= */
socket.on("receive-message", () => {
  loadMessages(activeChatUser);
});

socket.on("incoming-call", (data) => {
  const accept = confirm(
    `${data.callerName} is calling you (${data.type}). Accept?`
  );

  if (accept) {
    if (el("callStatus")) {
      el("callStatus").innerText = `${data.type} call connected`;
    }

    socket.emit("answer-call", {
      callerId: data.callerId,
      receiverId: getCurrentUserId(),
      answer: true
    });
  } else {
    socket.emit("reject-call", {
      callerId: data.callerId,
      receiverId: getCurrentUserId()
    });
  }
});

socket.on("call-answered", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call connected";
  }
});

socket.on("call-rejected", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call rejected";
  }
});

socket.on("call-ended", () => {
  if (el("callStatus")) {
    el("callStatus").innerText = "Call ended";
  }
});
