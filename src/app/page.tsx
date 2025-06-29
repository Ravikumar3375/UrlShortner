'use client';

import { shortenUrlAction, ShortenUrlActionState } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Check, Download, LogIn } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [longUrl, setLongUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenUrlActionState | null>(null);

  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (result) {
        if (result.error) {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
            setShortenedUrl(null);
            setQrCodeDataUrl(null);
        } else if (result.shortLink) {
            const fullShortUrl = `${window.location.origin}/${result.shortLink.shortCode}`;
            setShortenedUrl(fullShortUrl);
            
            QRCode.toDataURL(fullShortUrl, { width: 256, margin: 1 }, (err, url) => {
                if (!err) {
                    setQrCodeDataUrl(url);
                } else {
                    console.error('QR Code generation failed:', err);
                    setQrCodeDataUrl(null);
                }
            });
            setLongUrl('');
        }
    }
  }, [result, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to shorten URLs.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setShortenedUrl(null);
    setQrCodeDataUrl(null);

    try {
      const idToken = await user.getIdToken();
      const actionResult = await shortenUrlAction(longUrl, idToken);
      setResult(actionResult);
    } catch (error) {
      console.error(error);
      toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-48 w-full max-w-xl" />;
    }

    if (!user) {
      return (
        <Card className="w-full max-w-xl shadow-lg text-center">
          <CardHeader>
            <CardTitle className="font-headline">Welcome to LinkWise</CardTitle>
            <CardDescription>Log in to start shortening and tracking your links.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/login"><LogIn className="mr-2" /> Login</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Let's make it short!</CardTitle>
          <CardDescription>Paste your long URL below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="longUrl">URL to Shorten</Label>
              <Input
                id="longUrl"
                name="longUrl"
                type="url"
                placeholder="https://example.com/very-long-url-to-shorten"
                required
                className="h-12 text-base"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Shortening...' : 'Shorten URL'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-8 md:pt-16">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Shorten Your Links</h1>
        <p className="mt-4 text-lg text-foreground/80">
          Create short, memorable links in seconds. Track every click and measure your success. LinkWise is the wise choice for link management.
        </p>
      </div>

      {renderContent()}

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
            {qrCodeDataUrl && (
              <div className="mt-6 flex flex-col items-center gap-4 border-t pt-6">
                <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg border p-1 bg-white" />
                <a
                  href={qrCodeDataUrl}
                  download={`${result?.shortLink?.shortCode}-qrcode.png`}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  <Download className="mr-2" />
                  Download QR Code
                </a>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
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
