// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

/* SIGN UP */
export async function signup(email, password){
  return await createUserWithEmailAndPassword(auth, email, password);
}

/* LOGIN */
export async function login(email, password){
  return await signInWithEmailAndPassword(auth, email, password);
}

/* LOGOUT */
export async function logout(){
  return await signOut(auth);
}

/* AUTH WATCHER */
export function watchUser(callback){
  onAuthStateChanged(auth, callback);
}
