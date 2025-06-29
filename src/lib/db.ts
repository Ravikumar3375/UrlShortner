import 'server-only';
import type { ShortenedLink } from './types';

// In-memory store to simulate a database.
// In a real application, this would be a database like PostgreSQL, MongoDB, or Firebase.
const links: Map<string, ShortenedLink> = new Map();
const longUrlIndex: Map<string, string> = new Map(); // longUrl -> shortCode

// Pre-populate with some data for demonstration
const initialData: ShortenedLink[] = [
  {
    id: '1',
    longUrl: 'https://google.com',
    shortCode: 'ggl',
    clicks: 123,
    createdAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    lastAccessed: new Date('2023-10-28T14:30:00Z').toISOString(),
  },
  {
    id: '2',
    longUrl: 'https://github.com/facebook/react',
    shortCode: 'react',
    clicks: 45,
    createdAt: new Date('2023-10-27T11:00:00Z').toISOString(),
    lastAccessed: new Date('2023-10-28T12:15:00Z').toISOString(),
  },
];

initialData.forEach(link => {
  links.set(link.shortCode, link);
  longUrlIndex.set(link.longUrl, link.shortCode);
});

function generateShortCode(): string {
  // Simple short code generator. In a real app, use a more robust library
  // like nanoid and ensure uniqueness against the database.
  return Math.random().toString(36).substring(2, 8);
}

export async function getLinkByShortCode(shortCode: string): Promise<ShortenedLink | undefined> {
  return links.get(shortCode);
}

export async function getLinkByLongUrl(longUrl: string): Promise<ShortenedLink | undefined> {
  const shortCode = longUrlIndex.get(longUrl);
  return shortCode ? links.get(shortCode) : undefined;
}

export async function getAllLinks(): Promise<ShortenedLink[]> {
  return Array.from(links.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createShortLink(longUrl: string): Promise<ShortenedLink> {
  const existingLink = await getLinkByLongUrl(longUrl);
  if (existingLink) {
    return existingLink;
  }

  let shortCode = generateShortCode();
  // Ensure the generated code is unique
  while (links.has(shortCode)) {
    shortCode = generateShortCode();
  }

  const newLink: ShortenedLink = {
    id: (links.size + 1).toString(),
    longUrl,
    shortCode,
    clicks: 0,
    createdAt: new Date().toISOString(),
    lastAccessed: null,
  };

  links.set(newLink.shortCode, newLink);
  longUrlIndex.set(newLink.longUrl, newLink.shortCode);

  return newLink;
}

export async function incrementClick(shortCode: string): Promise<ShortenedLink | undefined> {
    const link = links.get(shortCode);
    if (link) {
        link.clicks += 1;
        link.lastAccessed = new Date().toISOString();
        return link;
    }
    return undefined;
}
