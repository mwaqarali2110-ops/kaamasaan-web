import type { Metadata } from 'next';
import { HelpCenter } from '@/features/support/HelpCenter';

export const metadata: Metadata = { title: 'Help Center' };

export default function HelpCenterPage() {
  return <HelpCenter />;
}
