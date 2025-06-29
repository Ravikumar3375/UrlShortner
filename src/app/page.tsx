'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link as LinkIcon, Check, Download, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { ShortenedLink } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { QRCodeModal } from '@/components/QRCodeModal';
import { formatDistanceToNow } from 'date-fns';

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

export default function Home() {
  const { toast } = useToast();

  const [longUrl, setLongUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [latestLink, setLatestLink] = useState<ShortenedLink | null>(null);

  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    try {
      const savedLinks = localStorage.getItem('shortenedLinks');
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
    } catch (error) {
      console.error("Failed to load links from local storage:", error);
      toast({
        title: 'Error',
        description: 'Could not load saved links from your browser.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    try {
      localStorage.setItem('shortenedLinks', JSON.stringify(links));
    } catch (error) {
      console.error("Failed to save links to local storage:", error);
    }
  }, [links]);

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [links]);


  useEffect(() => {
    if (latestLink) {
        const fullShortUrl = `${window.location.origin}/${latestLink.shortCode}`;
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
  }, [latestLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLatestLink(null);
    setShortenedUrl(null);
    setQrCodeDataUrl(null);

    try {
        new URL(longUrl);
    } catch (_) {
        toast({
            title: 'Error',
            description: 'Please enter a valid URL.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
      const shortCode = generateShortCode();
      const newLink: ShortenedLink = {
          id: shortCode,
          longUrl: longUrl,
          shortCode: shortCode,
          clicks: 0,
          createdAt: new Date().toISOString(),
          lastAccessed: null,
      };

      setLinks(prevLinks => [newLink, ...prevLinks]);
      setLatestLink(newLink);

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
  
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Short link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    toast({ title: 'Link deleted.' });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-8 md:pt-16">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Shorten Your Links</h1>
        <p className="mt-4 text-lg text-foreground/80">
          Create short, memorable links in seconds. Your links are saved in your browser's local storage.
        </p>
      </div>

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

      {shortenedUrl && latestLink && (
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
              <Button variant="ghost" size="icon" onClick={() => handleCopy(shortenedUrl)}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            {qrCodeDataUrl && (
              <div className="mt-6 flex flex-col items-center gap-4 border-t pt-6">
                <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg border p-1 bg-white" />
                <a
                  href={qrCodeDataUrl}
                  download={`${latestLink.shortCode}-qrcode.png`}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  <Download className="mr-2" />
                  Download QR Code
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {sortedLinks.length > 0 && (
        <Card className="w-full max-w-4xl shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="font-headline">Your Links</CardTitle>
            <CardDescription>
              Here are the links you've shortened. They are stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Link</TableHead>
                  <TableHead className="hidden md:table-cell">Original URL</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLinks.map((link) => {
                  const shortUrl = `${window.location.origin}/${link.shortCode}`;
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">{shortUrl}</a>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-sm truncate">
                        <a href={link.longUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">{link.longUrl}</a>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(shortUrl)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <QRCodeModal shortCode={link.shortCode} />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
