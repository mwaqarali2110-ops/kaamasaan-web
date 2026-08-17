import type { Metadata } from 'next';
import { MaintenancePlanDetails } from '@/features/services/MaintenancePlanDetails';

export const metadata: Metadata = { title: 'Maintenance Plan' };

export default async function Page({ params }: PageProps<'/services/maintenance/[planId]'>) {
  const { planId } = await params;
  return <MaintenancePlanDetails planId={planId} />;
}
