import type { Metadata } from 'next';
import { MyProjectScreen } from '@/features/my-project/MyProjectScreen';

export const metadata: Metadata = { title: 'My Project' };

export default function MyProjectPage() {
  return <MyProjectScreen />;
}
