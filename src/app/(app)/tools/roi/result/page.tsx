import type { Metadata } from 'next';
import { ROIResult } from '@/features/tools/ROIResult';

export const metadata: Metadata = { title: 'ROI Estimate' };

export default async function Page({ searchParams }: PageProps<'/tools/roi/result'>) {
  const params = await searchParams;
  return (
    <ROIResult
      systemSize={Number(params.systemSize) || undefined}
      batterySize={Number(params.batterySize) || undefined}
      totalCost={Number(params.totalCost) || undefined}
      estimatedMonthlySavings={Number(params.estimatedMonthlySavings) || undefined}
    />
  );
}
