import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCuWBNimKIHrVv_-DGrb8tiDZrlHMr_hV4",
  authDomain: "reactapp-8840b.firebaseapp.com",
  projectId: "reactapp-8840b",
  storageBucket: "reactapp-8840b.appspot.com",
  messagingSenderId: "869871661282",
  appId: "1:869871661282:web:6c4685572587e7824feebb",
  measurementId: "G-X3RQ8V3ZZL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };