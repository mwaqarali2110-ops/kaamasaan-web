import type { Metadata } from 'next';
import { SolarCareMembership } from '@/features/services/simpleServiceScreens';

export const metadata: Metadata = { title: 'Solar Care Membership' };

export default function Page() {
  return <SolarCareMembership />;
}
