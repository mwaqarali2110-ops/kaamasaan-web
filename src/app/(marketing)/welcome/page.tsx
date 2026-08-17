import type { Metadata } from 'next';
import { WelcomeScreen } from '@/features/onboarding/WelcomeScreen';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Design your solar system, compare products, and book a survey with KaamAsaan.'
};

export default function WelcomePage() {
  return <WelcomeScreen />;
}
