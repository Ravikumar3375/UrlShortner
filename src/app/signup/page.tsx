import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
    return (
        <div className="flex items-center justify-center pt-8 md:pt-16">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-6 w-6" />
                        Authentication Disabled
                    </CardTitle>
                    <CardDescription>
                        User login and signup functionality has been removed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
