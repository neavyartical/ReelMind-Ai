/* =========================
   CHAT MODULE
========================= */
import { API, auth, socket, el } from "./script.js";

let activeChatUser = "demo-user";
let typingTimer = null;

/* =========================
   GET CURRENT USER
========================= */
function getCurrentUserId() {
  return auth.currentUser?.uid || "guest";
}

/* =========================
   SET ACTIVE CHAT USER
========================= */
window.openChat = (userId) => {
  activeChatUser = userId;
  loadMessages(userId);
};

/* =========================
   LOAD MESSAGES
========================= */
window.loadMessages = async (targetUserId = activeChatUser) => {
  try {
    activeChatUser = targetUserId;

    const currentUser = getCurrentUserId();

    const response = await fetch(
      `${API}/messages/${currentUser}/${targetUserId}`
    );

    const data = await response.json();

    const messageList = el("messageList");
    if (!messageList) return;

    messageList.innerHTML = "";

    (data.messages || []).forEach(msg => {
      const mine = msg.sender === currentUser;

      messageList.innerHTML += `
        <div class="message ${mine ? "sent" : "received"}">
          ${msg.text}
        </div>
      `;
    });

    messageList.scrollTop = messageList.scrollHeight;
  } catch (error) {
    console.log("Load messages error:", error);
  }
};

/* =========================
   SEND MESSAGE
========================= */
window.sendMessage = async () => {
  const input = el("messageInput");
  const text = input?.value?.trim();

  if (!text) return;

  const sender = getCurrentUserId();

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
      receiverId: activeChatUser,
      text
    });

    input.value = "";

    loadMessages(activeChatUser);
  } catch (error) {
    console.log("Send message error:", error);
  }
};

/* =========================
   TYPING
========================= */
window.handleTyping = () => {
  const sender = getCurrentUserId();

  socket.emit("typing", {
    senderId: sender,
    receiverId: activeChatUser
  });

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    socket.emit("stop-typing", {
      senderId: sender,
      receiverId: activeChatUser
    });
  }, 1200);
};

/* =========================
   SOCKET EVENTS
========================= */
socket.on("receive-message", () => {
  loadMessages(activeChatUser);
});

socket.on("user-typing", () => {
  if (el("onlineStatus")) {
    el("onlineStatus").innerText = "Typing...";
  }
});

socket.on("user-stop-typing", () => {
  if (el("onlineStatus")) {
    el("onlineStatus").innerText = "Online";
  }
});

socket.on("online-users", () => {
  if (el("onlineStatus")) {
    el("onlineStatus").innerText = "Online";
  }
});
