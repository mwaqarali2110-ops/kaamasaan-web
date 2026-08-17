import type { Metadata } from 'next';
import { HowItWorks } from '@/features/support/HowItWorks';

export const metadata: Metadata = { title: 'How It Works' };

export default function HowItWorksPage() {
  return <HowItWorks />;
}
