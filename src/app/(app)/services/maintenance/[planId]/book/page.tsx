import type { Metadata } from 'next';
import { MaintenanceBooking } from '@/features/services/MaintenanceBooking';

export const metadata: Metadata = { title: 'Book Maintenance' };

export default async function Page({ params }: PageProps<'/services/maintenance/[planId]/book'>) {
  const { planId } = await params;
  return <MaintenanceBooking planId={planId} />;
}
