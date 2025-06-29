import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Analytics</h1>
        <p className="text-muted-foreground">
          Track the performance of all your shortened links.
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-6 w-6" />
            Feature Not Available
          </CardTitle>
          <CardDescription>
            This feature requires a backend database which has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The analytics page has been disabled because it relies on user authentication and a database to store and track link data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
