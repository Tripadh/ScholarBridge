import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  connectAuthEmulator 
} from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from "firebase/firestore";
import { 
  getStorage, 
  connectStorageEmulator 
} from "firebase/storage";

// 🔥 Your Firebase configuration (Cloud project)
const firebaseConfig = {
  apiKey: "AIzaSyAPMzhZjh8jtl-fVE9WDDZ_TcI9M8zksxg",
  authDomain: "helloworld-f3916.firebaseapp.com",
  projectId: "helloworld-f3916",
  storageBucket: "helloworld-f3916.appspot.com",
  messagingSenderId: "251129548703",
  appId: "1:251129548703:web:4325831523cddb8361f7aa",
  measurementId: "G-01SSSLZK1M"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Firebase Services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Connect to emulators (for local dev only)
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  console.log("⚡ Using Firebase Emulators...");

  connectAuthEmulator(auth, "http://127.0.0.1:9099");
 connectFirestoreEmulator(db, "127.0.0.1", 8085); // changed from 8080 to 8085

  connectStorageEmulator(storage, "127.0.0.1", 9198);
}

// ✅ Export everything you’ll use
export { auth, provider, storage, db };
export default app;
