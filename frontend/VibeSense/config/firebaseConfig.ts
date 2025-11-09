import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCeX0NvtgM0FLH3bmSpbIloSqskovVh97M",
  authDomain: "vibesense-b12ba.firebaseapp.com",
  databaseURL: "https://vibesense-b12ba-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vibesense-b12ba",
  storageBucket: "vibesense-b12ba.appspot.com",
  messagingSenderId: "138738417795",
  appId: "1:138738417795:web:c296e4ece7e62c3f0f9bb6",
  measurementId: "G-RKH69WXW9R"
};

let app;
let auth;

// Check if Firebase has already been initialized
if (getApps().length === 0) {
  // If not, initialize Firebase and Auth
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} else {
  // If already initialized, get the existing app and auth instances
  app = getApp();
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db = getFirestore(app);

export { auth, db };
