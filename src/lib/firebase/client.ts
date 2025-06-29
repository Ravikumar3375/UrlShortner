import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;

// We need at least the API key and project ID to initialize Firebase.
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  console.warn("Firebase client configuration is missing or incomplete in .env.local. Firebase features will be disabled on the client. Please create and populate a .env.local file with your Firebase project credentials.");
  // Use dummy/mock objects to prevent the app from crashing.
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export { app, auth };
