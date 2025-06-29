'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ShortenedLink } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ShortCodePage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (shortCode) {
      try {
        const savedLinksJSON = localStorage.getItem('shortenedLinks');
        if (savedLinksJSON) {
          const savedLinks: ShortenedLink[] = JSON.parse(savedLinksJSON);
          const link = savedLinks.find(l => l.shortCode === shortCode);

          if (link) {
            // Update click count and last accessed time
            const updatedLinks = savedLinks.map(l => 
              l.id === link.id 
                ? { ...l, clicks: l.clicks + 1, lastAccessed: new Date().toISOString() } 
                : l
            );
            localStorage.setItem('shortenedLinks', JSON.stringify(updatedLinks));

            // Redirect to the long URL
            window.location.href = link.longUrl;
          } else {
            setError('This short link was not found in your local storage.');
          }
        } else {
          setError('No links found in your local storage.');
        }
      } catch (e) {
        console.error("Redirection error:", e);
        setError('An error occurred while trying to redirect.');
      }
    }
  }, [shortCode]);

  if (error) {
    return (
        <div className="flex items-center justify-center pt-16">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Link Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-16 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting you to the original URL...</p>
    </div>
  );
}
