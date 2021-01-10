import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseApp = firebase.initializeApp({
  //config
  apiKey: "AIzaSyA5XRsT3nDnkQOJ_kQVLkthzIBIdIAhokU",
  authDomain: "superchat-4731b.firebaseapp.com",
  projectId: "superchat-4731b",
  storageBucket: "superchat-4731b.appspot.com",
  messagingSenderId: "149777113897",
  appId: "1:149777113897:web:c0ec0586673c949c2c8d38",
  measurementId: "G-766BWZXNLF",
});

const auth = firebaseApp.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider };
export default db;
