import admin from 'firebase-admin';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON
  ? JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON, 'base64').toString('ascii'))
  : undefined;

const adminApp = !getApps().length
  ? initializeApp({
      credential: admin.credential.cert(serviceAccountJson!),
    })
  : getApp();

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
