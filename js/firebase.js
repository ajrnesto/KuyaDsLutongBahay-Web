// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js';

export const app = initializeApp({
  apiKey: "AIzaSyBOFBpDkuJTyVkvY3xzcvk_VSstg3sehFw",
  authDomain: "kuya-d-s-lutong-bahay.firebaseapp.com",
  projectId: "kuya-d-s-lutong-bahay",
  storageBucket: "kuya-d-s-lutong-bahay.appspot.com",
  messagingSenderId: "1052663968739",
  appId: "1:1052663968739:web:0d5995568c285e302fa6d6",
  measurementId: "G-K20Z7N9GW4"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);