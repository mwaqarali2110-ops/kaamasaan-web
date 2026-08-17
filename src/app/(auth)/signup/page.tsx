import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/SignupForm';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage({ searchParams }: PageProps<'/signup'>) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : undefined;

  return <SignupForm redirectTo={redirectTo} />;
}
