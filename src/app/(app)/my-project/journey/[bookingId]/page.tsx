import type { Metadata } from 'next';
import { SolarJourneyView } from '@/features/my-project/SolarJourneyView';

export const metadata: Metadata = { title: 'My Solar Journey' };

export default async function SolarJourneyPage({
  params
}: PageProps<'/my-project/journey/[bookingId]'>) {
  const { bookingId } = await params;
  return <SolarJourneyView bookingId={bookingId} />;
}
