import type { Metadata } from 'next';
import { PreventiveMaintenance } from '@/features/services/PreventiveMaintenance';

export const metadata: Metadata = { title: 'Preventive Maintenance' };

export default function Page() {
  return <PreventiveMaintenance />;
}
