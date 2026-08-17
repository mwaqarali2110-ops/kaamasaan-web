import type { Metadata } from 'next';
import { SurveyConfirmationView } from '@/features/survey/SurveyConfirmationView';

export const metadata: Metadata = { title: 'Survey Request Received' };

export default async function SurveyConfirmationPage({
  params
}: PageProps<'/book-survey/confirmation/[bookingId]'>) {
  const { bookingId } = await params;
  return <SurveyConfirmationView bookingId={bookingId} />;
}
