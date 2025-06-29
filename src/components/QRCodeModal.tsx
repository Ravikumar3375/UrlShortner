'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Download, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  shortCode: string;
}

export function QRCodeModal({ shortCode }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    // This effect runs on the client after hydration to safely access window.location
    if (typeof window !== 'undefined') {
      setShortUrl(`${window.location.origin}/${shortCode}`);
    }
  }, [shortCode]);

  useEffect(() => {
    // Generate QR code only when the dialog is opened to save resources
    if (isOpen && shortUrl && !qrCodeDataUrl) {
      QRCode.toDataURL(shortUrl, { width: 256, margin: 1 }, (err, url) => {
        if (!err) {
          setQrCodeDataUrl(url);
        } else {
          console.error('Failed to generate QR code:', err);
        }
      });
    }
  }, [isOpen, shortUrl, qrCodeDataUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Show QR Code">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="font-headline">QR Code</DialogTitle>
          <DialogDescription>
            Scan or download the QR code for your link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          {qrCodeDataUrl && shortUrl ? (
            <>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-muted-foreground break-all hover:underline">
                {shortUrl}
              </a>
              <img src={qrCodeDataUrl} alt={`QR Code for ${shortUrl}`} className="rounded-lg border p-1 bg-white" />
              <a
                href={qrCodeDataUrl}
                download={`${shortCode}-qrcode.png`}
                className={buttonVariants({ variant: 'default' })}
              >
                <Download className="mr-2" />
                Download
              </a>
            </>
          ) : (
            <div className="h-[290px] w-full flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">Generating...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
