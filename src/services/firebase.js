import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJSPYjun1C11G9VynQvmBsvG8roto5FBA",
  authDomain: "sunmanlar-31f36.firebaseapp.com",
  projectId: "sunmanlar-31f36",
  storageBucket: "sunmanlar-31f36.firebasestorage.app",
  messagingSenderId: "106447788622",
  appId: "1:106447788622:web:1bb8841cbeadb0c435c11f",
  measurementId: "G-X69G8052VE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (safe initialize for browser environment)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
export { analytics };

// Collections constants
export const COLLECTIONS = {
  PERSONS: "persons",
  PHOTOS: "photos",
  WALL_POSTS: "wall_posts",
  PENDING_REQUESTS: "pending_requests",
  SETTINGS: "settings"
};

/**
 * Upload an image to Firebase Storage
 */
export async function uploadImageFile(file, path) {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn("Storage upload failed, fallback to base64 data URL:", err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}
