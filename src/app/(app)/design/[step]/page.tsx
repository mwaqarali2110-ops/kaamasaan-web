import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DesignWizard } from '@/features/design/DesignWizard';
import { STEP_TITLES, toStep } from '@/features/design/wizard';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/design-system/DesignSystemFlowScreen.tsx.
 *
 * Mobile holds the wizard step in component state; on web it is a path segment
 * so each step is linkable and browser back works. Step guarding and forward
 * transitions live in `DesignWizard`.
 */
export async function generateMetadata({
  params
}: PageProps<'/design/[step]'>): Promise<Metadata> {
  const { step } = await params;
  const parsed = toStep(step);
  return { title: parsed ? STEP_TITLES[parsed] : 'Design Your System' };
}

export default async function DesignStepPage({ params }: PageProps<'/design/[step]'>) {
  const { step } = await params;
  const parsed = toStep(step);
  if (!parsed) notFound();

  return <DesignWizard step={parsed} />;
}
