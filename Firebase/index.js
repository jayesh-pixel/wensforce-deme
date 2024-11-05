// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiXGzOoDq33CElHnc_yUVASdoYIyRANzg",
  authDomain: "jp-1234567890.firebaseapp.com",
  projectId: "jp-1234567890",
  storageBucket: "jp-1234567890.appspot.com",
  messagingSenderId: "49554690810",
  appId: "1:49554690810:web:2af413401ce1f7ff7bef43",
  measurementId: "G-0GHDR5078X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export {db, storage}