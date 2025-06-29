import { getLinkByShortCode, incrementClick } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';

type Props = {
  params: {
    shortCode: string;
  };
};

// Disable caching for this page to ensure click counts are always updated.
export const dynamic = 'force-dynamic';

export default async function ShortCodePage({ params }: Props) {
  const { shortCode } = params;
  const link = await getLinkByShortCode(shortCode);

  if (link) {
    await incrementClick(shortCode);
    redirect(link.longUrl);
  } else {
    notFound();
  }
}
