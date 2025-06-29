export interface ShortenedLink {
  id: string;
  longUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string; // Using ISO string for serialization
  lastAccessed: string | null; // Using ISO string for serialization
}
