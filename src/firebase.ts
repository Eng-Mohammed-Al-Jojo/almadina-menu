/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvlFTtqLZ47_g_0zwjR-aNJ1DXxpuFVr0",
  authDomain: "almadina-res.firebaseapp.com",
  databaseURL: "https://almadina-res-default-rtdb.firebaseio.com",
  projectId: "almadina-res",
  storageBucket: "almadina-res.firebasestorage.app",
  messagingSenderId: "292341794167",
  appId: "1:292341794167:web:638ce67d080f398fcbcd72",
  measurementId: "G-SSL4THZDFM"
};
const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
