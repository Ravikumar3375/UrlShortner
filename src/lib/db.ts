import 'server-only';
import type { ShortenedLink } from './types';
import { adminDb } from './firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export async function getLinkByShortCode(shortCode: string): Promise<ShortenedLink | undefined> {
  const doc = await adminDb.collection('links').doc(shortCode).get();
  if (!doc.exists) {
    return undefined;
  }
  return { id: doc.id, ...doc.data() } as ShortenedLink;
}

export async function getAllLinks(userId: string): Promise<ShortenedLink[]> {
  const snapshot = await adminDb.collection('links').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShortenedLink));
}

export async function createShortLink(longUrl: string, userId: string): Promise<ShortenedLink> {
  // Check if this user has already shortened this URL
  const existingQuery = await adminDb.collection('links').where('longUrl', '==', longUrl).where('userId', '==', userId).limit(1).get();
  if (!existingQuery.empty) {
      const doc = existingQuery.docs[0];
      return { id: doc.id, ...doc.data() } as ShortenedLink;
  }

  let shortCode = generateShortCode();
  let isUnique = false;

  // Ensure the generated code is unique
  while(!isUnique) {
    const doc = await adminDb.collection('links').doc(shortCode).get();
    if (!doc.exists) {
        isUnique = true;
    } else {
        shortCode = generateShortCode();
    }
  }

  const newLink: Omit<ShortenedLink, 'id'> = {
    userId,
    longUrl,
    shortCode,
    clicks: 0,
    createdAt: new Date().toISOString(),
    lastAccessed: null,
  };

  await adminDb.collection('links').doc(shortCode).set(newLink);

  return { id: shortCode, ...newLink };
}

export async function incrementClick(shortCode: string): Promise<ShortenedLink | undefined> {
    const linkRef = adminDb.collection('links').doc(shortCode);
    const doc = await linkRef.get();
    if (doc.exists) {
        await linkRef.update({
            clicks: FieldValue.increment(1),
            lastAccessed: new Date().toISOString(),
        });
        const updatedDoc = await linkRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as ShortenedLink;
    }
    return undefined;
}
