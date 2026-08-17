import type { Metadata } from 'next';
import { PremiumCareProgress } from '@/features/services/PremiumCareProgress';

export const metadata: Metadata = { title: 'Premium Care Progress' };

export default async function Page({ searchParams }: PageProps<'/services/premium-care'>) {
  const params = await searchParams;
  const str = (value: unknown) => (typeof value === 'string' ? value : undefined);

  return (
    <PremiumCareProgress
      planId={str(params.planId)}
      requestId={str(params.requestId)}
      visitId={str(params.visitId)}
    />
  );
}
