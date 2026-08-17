import type { Metadata } from 'next';
import { ElectricalServices } from '@/features/services/ElectricalServices';

export const metadata: Metadata = { title: 'Electrical Work' };

export default function Page() {
  return <ElectricalServices />;
}
