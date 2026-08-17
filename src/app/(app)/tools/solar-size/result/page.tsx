import type { Metadata } from 'next';
import { RecommendedSolarSize } from '@/features/tools/RecommendedSolarSize';

export const metadata: Metadata = { title: 'Recommended Solar Size' };

export default async function Page({ searchParams }: PageProps<'/tools/solar-size/result'>) {
  const params = await searchParams;
  return (
    <RecommendedSolarSize
      loadKw={Number(params.loadKw) || 0}
      systemKw={Number(params.systemKw) || 0}
    />
  );
}
