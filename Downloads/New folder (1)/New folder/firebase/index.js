
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// const firebaseConfig = {
//     apiKey: "key",
//     authDomain: "key",
//     projectId: "key",
//     storageBucket: "key",
//     messagingSenderId: "key",
//     appId: "key",
//     measurementId: "key"
// };
const firebaseConfig = {
    apiKey: "AIzaSyCmcAZkFWo0wQXQO5yWHjC1Uzw5-v7a_xM",
    authDomain: "common-project-123.firebaseapp.com",
    projectId: "common-project-123",
    storageBucket: "common-project-123.appspot.com",
    messagingSenderId: "1016692750956",
    appId: "1:1016692750956:web:64289af74029a9bf89f649",
    measurementId: "G-5R1LT0YRRR"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);