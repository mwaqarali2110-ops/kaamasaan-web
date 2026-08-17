import type { Metadata } from 'next';
import { RoofSpaceTool } from '@/features/tools/RoofSpaceTool';

export const metadata: Metadata = { title: 'Roof Space Calculator' };

export default function Page() {
  return <RoofSpaceTool />;
}
