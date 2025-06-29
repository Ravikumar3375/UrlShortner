
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ShortenedLink } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns';
import { BarChart, ExternalLink } from 'lucide-react';

export default function AnalyticsPage() {
  const [links, setLinks] = useState<ShortenedLink[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedLinks = localStorage.getItem('shortenedLinks');
      if (savedLinks) {
        setLinks(JSON.parse(savedLinks));
      }
    } catch (error) {
      console.error("Failed to load links from local storage:", error);
    }
  }, []);

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [links]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  if (links.length === 0) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
                    <BarChart />
                    Analytics
                </h1>
                <p className="text-muted-foreground">
                Track the performance of all your shortened links.
                </p>
            </div>
    
            <Card className="w-full max-w-2xl mx-auto text-center">
                <CardHeader>
                <CardTitle>No Links Yet</CardTitle>
                <CardDescription>
                    You haven't shortened any links. Once you do, their stats will appear here.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        Your link analytics are stored locally in your browser.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
          <BarChart />
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Track the performance of all your shortened links. Data is stored in your browser.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Link Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short Link</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Accessed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLinks.map((link) => {
                const shortUrl = typeof window !== 'undefined' ? `${window.location.origin}/${link.shortCode}` : `/${link.shortCode}`;
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono flex items-center gap-2">
                        {shortUrl.replace('https://', '').replace('http://', '')} <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                    <TableCell className="max-w-xs md:max-w-sm truncate">
                       <a href={link.longUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">{link.longUrl}</a>
                    </TableCell>
                    <TableCell className="text-center font-bold">{link.clicks}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(link.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {link.lastAccessed ? format(new Date(link.lastAccessed), 'MMM d, yyyy, p') : 'Never'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
