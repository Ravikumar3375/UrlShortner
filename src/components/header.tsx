'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { UserNav } from '@/components/auth/UserNav';
import { Skeleton } from '@/components/ui/skeleton';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="LinkWise Home">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-headline text-primary">LinkWise</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            {user && (
                 <Button variant="ghost" asChild>
                    <Link href="/analytics">Analytics</Link>
                </Button>
            )}
            <div className="w-[100px] flex justify-end">
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : user ? (
                <UserNav />
              ) : (
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
