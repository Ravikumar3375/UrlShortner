'use server';

import { z } from 'zod';
import { createShortLink } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ShortenedLink } from '@/lib/types';

const urlSchema = z.string().url({ message: 'Please enter a valid URL.' });

interface ActionState {
  message: string;
  shortLink: ShortenedLink | null;
  error: boolean;
}

export async function shortenUrlAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const longUrl = formData.get('longUrl');

  const validatedUrl = urlSchema.safeParse(longUrl);

  if (!validatedUrl.success) {
    return {
      message: validatedUrl.error.errors[0].message,
      shortLink: null,
      error: true,
    };
  }

  try {
    const shortLink = await createShortLink(validatedUrl.data);
    // Revalidate the analytics page to show the new link
    revalidatePath('/analytics'); 
    return {
      message: 'URL shortened successfully!',
      shortLink,
      error: false,
    };
  } catch (error) {
    return {
      message: 'An error occurred on the server. Please try again.',
      shortLink: null,
      error: true,
    };
  }
}
