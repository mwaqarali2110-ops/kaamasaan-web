import type { Metadata } from 'next';
import { InstallationService } from '@/features/services/InstallationService';

export const metadata: Metadata = { title: 'Solar Panel Installation' };

export default function Page() {
  return <InstallationService />;
}
