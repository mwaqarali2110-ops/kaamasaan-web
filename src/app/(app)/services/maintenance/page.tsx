import type { Metadata } from 'next';
import { MaintenancePackages } from '@/features/services/MaintenancePackages';

export const metadata: Metadata = { title: 'Maintenance Packages' };

export default function Page() {
  return <MaintenancePackages />;
}
