import type { Metadata } from 'next';
import { MaintenanceBookingConfirmation } from '@/features/services/simpleServiceScreens';

export const metadata: Metadata = { title: 'Maintenance Booked' };

export default async function Page({
  params
}: PageProps<'/services/maintenance/confirmation/[requestId]'>) {
  const { requestId } = await params;
  return <MaintenanceBookingConfirmation requestId={requestId} />;
}
