import type { Metadata } from 'next';
import { BatteryRunningLoad } from '@/features/tools/BatteryRunningLoad';

export const metadata: Metadata = { title: 'Running Load' };

export default function Page() {
  return <BatteryRunningLoad />;
}
