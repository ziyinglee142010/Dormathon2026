import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCWClalC8v_aMXkaCjzx2N4vkZL5VX8aFU",
  authDomain: "fyp-mcs17.firebaseapp.com",
  projectId: "fyp-mcs17",
  storageBucket: "fyp-mcs17.firebasestorage.app",
  messagingSenderId: "13822260631",
  appId: "1:13822260631:web:9397163e7a19767120c0d2"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
