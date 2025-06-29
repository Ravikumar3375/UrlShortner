'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { shortenUrlAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Check } from 'lucide-react';

const initialState = {
  message: '',
  shortLink: null,
  error: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Shortening...' : 'Shorten URL'}
    </Button>
  );
}

export default function Home() {
  const [state, formAction] = useFormState(shortenUrlAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.error) {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      } else if (state.shortLink) {
        const fullShortUrl = `${window.location.origin}/${state.shortLink.shortCode}`;
        setShortenedUrl(fullShortUrl);
        formRef.current?.reset();
      }
    }
  }, [state, toast]);
  
  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-8 md:pt-16">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Shorten Your Links</h1>
        <p className="mt-4 text-lg text-foreground/80">
          Create short, memorable links in seconds. Track every click and measure your success. LinkWise is the wise choice for link management.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Let's make it short!</CardTitle>
          <CardDescription>Paste your long URL below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longUrl">URL to Shorten</Label>
              <Input
                id="longUrl"
                name="longUrl"
                type="url"
                placeholder="https://example.com/very-long-url-to-shorten"
                required
                className="h-12 text-base"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {shortenedUrl && (
        <Card className="w-full max-w-xl shadow-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          <CardHeader>
            <CardTitle className="font-headline">Your Link is Ready!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
              <LinkIcon className="h-5 w-5 text-primary" />
              <input 
                readOnly 
                value={shortenedUrl} 
                className="flex-1 bg-transparent outline-none text-primary font-mono"
              />
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You can now copy and share your new short link. Analytics are available on the{' '}
              <a href="/analytics" className="underline text-accent hover:text-accent/80">
                Analytics page
              </a>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
