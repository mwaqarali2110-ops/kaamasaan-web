import type { Metadata } from 'next';
import { CleaningEstimator } from '@/features/services/CleaningEstimator';

export const metadata: Metadata = { title: 'Solar Panel Cleaning' };

export default function Page() {
  return <CleaningEstimator />;
}
