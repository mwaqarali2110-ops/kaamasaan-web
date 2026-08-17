import type { Metadata } from 'next';
import { LiveTracking } from '@/features/services/simpleServiceScreens';

export const metadata: Metadata = { title: 'Live Tracking' };

export default function Page() {
  return <LiveTracking />;
}
