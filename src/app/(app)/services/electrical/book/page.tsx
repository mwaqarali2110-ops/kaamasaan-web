import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ElectricalBooking } from '@/features/services/ElectricalBooking';
import type { ElectricalServiceType } from '@/constants/routes';

export const metadata: Metadata = { title: 'Book Electrical Work' };

const SERVICES: ElectricalServiceType[] = [
  'load_distribution',
  'single_phase_to_3_phase_wiring',
  'diagnostic_services'
];

export default async function Page({ searchParams }: PageProps<'/services/electrical/book'>) {
  const params = await searchParams;
  const selected = params.selectedService;
  if (typeof selected !== 'string' || !(SERVICES as string[]).includes(selected)) notFound();

  return <ElectricalBooking selectedService={selected as ElectricalServiceType} />;
}
