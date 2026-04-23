/* =========================
   CHAT FUNCTIONS
========================= */

const API = "https://reelmindbackend-1.onrender.com";

function el(id) {
  return document.getElementById(id);
}

let selectedUser = "demo-user";

/* =========================
   LOAD CHAT
========================= */
window.loadMessages = async (targetUserId) => {
  try {
    selectedUser = targetUserId;

    const currentUser = window.currentUserId || "guest";

    const res = await fetch(
      `${API}/messages/${currentUser}/${targetUserId}`
    );

    const data = await res.json();

    const box = el("messageList");
    if (!box) return;

    box.innerHTML = "";

    (data.messages || []).forEach(msg => {
      const mine = msg.sender === currentUser;

      box.innerHTML += `
        <div class="message ${mine ? "sent" : "received"}">
          ${msg.text}
        </div>
      `;
    });

    box.scrollTop = box.scrollHeight;
  } catch (error) {
    console.log("Message load error:", error);
  }
};

/* =========================
   SEND MESSAGE
========================= */
window.sendMessage = async () => {
  const input = el("messageInput");
  const text = input?.value?.trim();

  if (!text) return;

  const sender = window.currentUserId || "guest";

  try {
    await fetch(`${API}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender,
        receiver: selectedUser,
        text
      })
    });

    input.value = "";

    loadMessages(selectedUser);
  } catch (error) {
    console.log("Send message error:", error);
  }
};

/* =========================
   TYPING STATUS
========================= */
window.handleTyping = () => {
  if (!window.socket) return;

  window.socket.emit("typing", {
    senderId: window.currentUserId,
    receiverId: selectedUser
  });

  clearTimeout(window.typingTimeout);

  window.typingTimeout = setTimeout(() => {
    window.socket.emit("stop-typing", {
      senderId: window.currentUserId,
      receiverId: selectedUser
    });
  }, 1200);
};

/* =========================
   SOCKET CHAT EVENTS
========================= */
window.setupChatSocket = () => {
  if (!window.socket) return;

  window.socket.on("receive-message", () => {
    loadMessages(selectedUser);
  });

  window.socket.on("user-typing", () => {
    const status = el("onlineStatus");
    if (status) status.innerText = "Typing...";
  });

  window.socket.on("user-stop-typing", () => {
    const status = el("onlineStatus");
    if (status) status.innerText = "Online";
  });

  window.socket.on("online-users", () => {
    const status = el("onlineStatus");
    if (status) status.innerText = "Online";
  });
};
