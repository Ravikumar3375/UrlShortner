import admin from 'firebase-admin';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Define placeholder objects for when Firebase isn't configured
let adminApp: admin.app.App;
let adminAuth: ReturnType<typeof getAuth>;
let adminDb: ReturnType<typeof getFirestore>;

if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON && process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON !== 'your_base64_encoded_service_account_json_here') {
  try {
    const serviceAccountJson = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON,
        'base64'
      ).toString('utf-8')
    );
    
    adminApp = !getApps().length
      ? initializeApp({ credential: cert(serviceAccountJson) })
      : getApp();

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (e) {
    console.error("Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or initialize Firebase Admin SDK.", e);
    adminApp = {} as admin.app.App;
    adminAuth = {} as ReturnType<typeof getAuth>;
    adminDb = {} as ReturnType<typeof getFirestore>;
  }
} else {
  console.warn(
    'Firebase Admin configuration is missing from environment variables. Server-side features requiring Firebase will not work.'
  );
  adminApp = {} as admin.app.App;
  adminAuth = {} as ReturnType<typeof getAuth>;
  adminDb = {} as ReturnType<typeof getFirestore>;
}

export { adminApp, adminAuth, adminDb };
