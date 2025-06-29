'use server';

import { z } from 'zod';
import type { ShortenedLink } from '@/lib/types';

const urlSchema = z.string().url({ message: 'Please enter a valid URL.' });

export interface ShortenUrlActionState {
  message: string;
  shortLink: ShortenedLink | null;
  error: boolean;
}

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}


export async function shortenUrlAction(
  longUrl: string,
): Promise<ShortenUrlActionState> {

  const validatedUrl = urlSchema.safeParse(longUrl);

  if (!validatedUrl.success) {
    return {
      message: validatedUrl.error.errors[0].message,
      shortLink: null,
      error: true,
    };
  }

  try {
    const shortCode = generateShortCode();
    const shortLink: ShortenedLink = {
        id: shortCode,
        longUrl: validatedUrl.data,
        shortCode: shortCode,
        clicks: 0,
        createdAt: new Date().toISOString(),
        lastAccessed: null,
    };

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
