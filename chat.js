import { API, el } from "./script.js";
import { auth } from "./firebase.js";
import { socket } from "./socket.js";

let activeChatUser = "demo-user";
let typingTimeout = null;

/* =========================
   CURRENT USER
========================= */
function getCurrentUserId() {
  return auth?.currentUser?.uid || null;
}

/* =========================
   AUTO SCROLL
========================= */
function scrollMessages() {
  const list = el("messageList");
  if (!list) return;

  list.scrollTop = list.scrollHeight;
}

/* =========================
   STATUS
========================= */
function setStatus(text = "") {
  const status = el("callStatus");
  if (!status) return;

  status.innerText = text;
}

/* =========================
   RENDER MESSAGE
========================= */
function renderMessage(msg, currentUser) {
  const list = el("messageList");
  if (!list) return;

  const mine = msg.sender === currentUser;

  const div = document.createElement("div");
  div.className = `message ${mine ? "sent" : "received"}`;

  if (msg.fileUrl) {
    if (msg.fileType?.startsWith("image")) {
      div.innerHTML = `
        <img src="${msg.fileUrl}" class="chat-media">
      `;
    } else if (msg.fileType?.startsWith("video")) {
      div.innerHTML = `
        <video controls class="chat-media">
          <source src="${msg.fileUrl}">
        </video>
      `;
    } else {
      div.innerHTML = `
        <a href="${msg.fileUrl}" target="_blank">📎 Download file</a>
      `;
    }
  } else {
    div.textContent = msg.text || "";
  }

  list.appendChild(div);
}

/* =========================
   LOAD MESSAGES
========================= */
window.loadMessages = async (targetUserId = activeChatUser) => {
  try {
    activeChatUser = targetUserId;

    const sender = getCurrentUserId();
    if (!sender) return;

    const res = await fetch(
      `${API}/messages/${sender}/${targetUserId}`
    );

    const data = await res.json();

    const list = el("messageList");
    if (!list) return;

    list.innerHTML = "";

    (data.messages || []).forEach(msg => {
      renderMessage(msg, sender);
    });

    scrollMessages();
  } catch (error) {
    console.log("Load messages error:", error);
  }
};

/* =========================
   SEND TEXT MESSAGE
========================= */
window.sendMessage = async () => {
  const input = el("messageInput");
  const text = input?.value?.trim();
  const sender = getCurrentUserId();

  if (!text || !sender) return;

  try {
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
      receiverId: activeChatUser
    });

    input.value = "";
    loadMessages(activeChatUser);
  } catch (error) {
    console.log("Send message error:", error);
  }
};

/* =========================
   SEND FILE
========================= */
window.sendChatFile = async file => {
  const sender = getCurrentUserId();
  if (!sender || !file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("sender", sender);
  formData.append("receiver", activeChatUser);

  try {
    await fetch(`${API}/messages/upload`, {
      method: "POST",
      body: formData
    });

    socket.emit("send-message", {
      senderId: sender,
      receiverId: activeChatUser
    });

    loadMessages(activeChatUser);
  } catch (error) {
    console.log("File send error:", error);
  }
};

/* =========================
   TYPING STATUS
========================= */
function emitTyping() {
  const sender = getCurrentUserId();
  if (!sender) return;

  socket.emit("typing", {
    senderId: sender,
    receiverId: activeChatUser
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    socket.emit("stop-typing", {
      senderId: sender,
      receiverId: activeChatUser
    });
  }, 1000);
}

/* =========================
   CALLS
========================= */
window.startCall = () => {
  const callerId = getCurrentUserId();
  if (!callerId) return;

  socket.emit("call-user", {
    callerId,
    receiverId: activeChatUser,
    callerName: auth.currentUser?.email || "User",
    type: "audio"
  });

  setStatus("Calling...");
};

window.startVideoCall = () => {
  const callerId = getCurrentUserId();
  if (!callerId) return;

  socket.emit("call-user", {
    callerId,
    receiverId: activeChatUser,
    callerName: auth.currentUser?.email || "User",
    type: "video"
  });

  setStatus("Video calling...");
};

window.endCall = () => {
  const callerId = getCurrentUserId();

  socket.emit("end-call", {
    callerId,
    receiverId: activeChatUser
  });

  setStatus("Call ended");
};

/* =========================
   SOCKET EVENTS
========================= */
socket.on("receive-message", () => {
  loadMessages(activeChatUser);
});

socket.on("user-typing", () => {
  setStatus("Typing...");
});

socket.on("user-stop-typing", () => {
  setStatus("");
});

socket.on("incoming-call", data => {
  const accept = confirm(
    `${data.callerName} is calling (${data.type}). Accept?`
  );

  if (accept) {
    socket.emit("answer-call", {
      callerId: data.callerId,
      receiverId: getCurrentUserId()
    });

    setStatus("Call connected");
  } else {
    socket.emit("reject-call", {
      callerId: data.callerId,
      receiverId: getCurrentUserId()
    });
  }
});

socket.on("call-answered", () => {
  setStatus("Call connected");
});

socket.on("call-rejected", () => {
  setStatus("Call rejected");
});

socket.on("call-ended", () => {
  setStatus("Call ended");
});

/* =========================
   INPUT LISTENERS
========================= */
window.addEventListener("load", () => {
  const input = el("messageInput");

  if (!input) return;

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.sendMessage();
    }
  });

  input.addEventListener("input", emitTyping);
});
