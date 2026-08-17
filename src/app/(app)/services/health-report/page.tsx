import type { Metadata } from 'next';
import { PostServiceHealthReport } from '@/features/services/simpleServiceScreens';

export const metadata: Metadata = { title: 'Post Service Health Report' };

export default function Page() {
  return <PostServiceHealthReport />;
}
