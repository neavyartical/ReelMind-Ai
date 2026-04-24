// socket.js
import { auth } from "./firebase.js";
import { API } from "./script.js";

import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

/* =========================
   SOCKET CONNECTION
========================= */
export const socket = io(API, {
  transports: ["websocket"],
  autoConnect: false
});

/* =========================
   CONNECT USER
========================= */
function registerUser(user) {
  if (!user?.uid) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("register", user.uid);
}

/* =========================
   DISCONNECT USER
========================= */
function unregisterUser() {
  if (socket.connected) {
    socket.disconnect();
  }
}

/* =========================
   AUTH WATCHER
========================= */
auth.onAuthStateChanged(user => {
  if (user) {
    registerUser(user);
  } else {
    unregisterUser();
  }
});

/* =========================
   DEBUG
========================= */
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});
