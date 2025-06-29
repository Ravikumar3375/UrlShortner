'use server';

import { z } from 'zod';
import { createShortLink, getAllLinks } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ShortenedLink } from '@/lib/types';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const urlSchema = z.string().url({ message: 'Please enter a valid URL.' });

export interface ShortenUrlActionState {
  message: string;
  shortLink: ShortenedLink | null;
  error: boolean;
}

export async function shortenUrlAction(
  longUrl: string,
  idToken: string | undefined
): Promise<ShortenUrlActionState> {

  if (typeof adminDb?.collection !== 'function') {
    return {
        message: 'Firebase Admin SDK is not configured on the server. Please check your environment variables.',
        shortLink: null,
        error: true,
    };
  }

  if (!idToken) {
    return {
      message: 'You must be logged in to shorten links.',
      shortLink: null,
      error: true,
    };
  }
  
  let uid: string;
  try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      uid = decodedToken.uid;
  } catch (error) {
       return {
          message: 'Authentication failed. Please log in again.',
          shortLink: null,
          error: true,
        };
  }

  const validatedUrl = urlSchema.safeParse(longUrl);

  if (!validatedUrl.success) {
    return {
      message: validatedUrl.error.errors[0].message,
      shortLink: null,
      error: true,
    };
  }

  try {
    const shortLink = await createShortLink(validatedUrl.data, uid);
    // Revalidate the analytics page to show the new link
    revalidatePath('/analytics'); 
    return {
      message: 'URL shortened successfully!',
      shortLink,
      error: false,
    };
  } catch (error) {
    console.error("Error creating short link:", error);
    return {
      message: 'An error occurred on the server. Please try again.',
      shortLink: null,
      error: true,
    };
  }
}


export async function getUserLinksAction(idToken: string | undefined): Promise<ShortenedLink[]> {
    if (typeof adminDb?.collection !== 'function') {
      console.error('Firebase Admin SDK is not configured on the server. Please check your environment variables.');
      return [];
    }

    if (!idToken) {
        return [];
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        return await getAllLinks(uid);
    } catch (error) {
        console.error("Failed to verify token or get links", error);
        return [];
    }
}
