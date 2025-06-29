import admin from 'firebase-admin';
import { getApps, getApp, initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Define placeholder objects for when Firebase isn't configured
let adminApp: admin.app.App;
let adminAuth: ReturnType<typeof getAuth>;
let adminDb: ReturnType<typeof getFirestore>;

// Construct a service account object from environment variables.
// This is a more robust method than parsing a Base64 encoded JSON string.
const serviceAccount: ServiceAccount | undefined = 
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key from the environment variable needs its newline characters restored.
        // JSON stringifies '\n' as '\\n', so we reverse that.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    : undefined;

if (serviceAccount) {
  try {
    // Initialize the app, or get the existing one if it's already initialized.
    // This prevents re-initialization errors during hot reloads in development.
    adminApp = !getApps().length
      ? initializeApp({ credential: cert(serviceAccount) })
      : getApp();

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (e) {
    console.error("Failed to initialize Firebase Admin SDK from service account.", e);
    // Set to dummy objects to prevent crashes on subsequent calls.
    adminApp = {} as admin.app.App;
    adminAuth = {} as ReturnType<typeof getAuth>;
    adminDb = {} as ReturnType<typeof getFirestore>;
  }
} else {
  console.warn(
    'Firebase Admin configuration is missing from environment variables. Server-side features requiring Firebase will not work.'
  );
  // Set to dummy objects to prevent crashes.
  adminApp = {} as admin.app.App;
  adminAuth = {} as ReturnType<typeof getAuth>;
  adminDb = {} as ReturnType<typeof getFirestore>;
}

export { adminApp, adminAuth, adminDb };
