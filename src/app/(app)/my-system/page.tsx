import type { Metadata } from 'next';
import { MySystemScreen } from '@/features/my-system/MySystemScreen';

export const metadata: Metadata = { title: 'My System' };

export default function MySystemPage() {
  return <MySystemScreen />;
}
