import { getAllLinks } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BarChart2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function AnalyticsPage() {
  const links = await getAllLinks();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Analytics</h1>
          <p className="text-muted-foreground">
            Track the performance of all your shortened links.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Links</CardTitle>
          <CardDescription>A list of all your created short links and their click counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short Link</TableHead>
                <TableHead className="hidden md:table-cell">Original URL</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Last Accessed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length > 0 ? (
                links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Link
                        href={`/${link.shortCode}`}
                        target="_blank"
                        className="font-medium text-primary hover:underline flex items-center gap-2"
                        aria-label={`Open short link /${link.shortCode}`}
                      >
                        /{link.shortCode} <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-sm truncate">
                        <Link href={link.longUrl} target="_blank" className="hover:underline text-muted-foreground" aria-label={`Open original link for ${link.longUrl}`}>
                            {link.longUrl}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                        <BarChart2 className="h-3.5 w-3.5 text-accent" />
                        {link.clicks.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {link.lastAccessed ? formatDistanceToNow(new Date(link.lastAccessed), { addSuffix: true }) : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No links created yet. Start by shortening a URL on the home page!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
