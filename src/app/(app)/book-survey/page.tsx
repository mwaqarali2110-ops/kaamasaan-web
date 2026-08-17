import type { Metadata } from 'next';
import { BookSurveyForm } from '@/features/survey/BookSurveyForm';
import type { BookingContext } from '@/store/useSystemStore';
import type { ElectricalServiceType } from '@/constants/routes';

export const metadata: Metadata = { title: 'Book Survey' };

const BOOKING_CONTEXTS: BookingContext[] = [
  'general',
  'solar_package',
  'custom_system',
  'cleaning',
  'installation',
  'electrical'
];

const ELECTRICAL_SERVICES: ElectricalServiceType[] = [
  'load_distribution',
  'single_phase_to_3_phase_wiring',
  'diagnostic_services'
];

const asOneOf = <T extends string>(allowed: T[], value: unknown): T | undefined =>
  typeof value === 'string' && (allowed as string[]).includes(value) ? (value as T) : undefined;

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/survey/BookSurveyScreen.tsx.
 *
 * Mobile's route params become search params. They arrive from an untrusted URL,
 * so the union-typed ones are validated rather than cast — an unknown context
 * falls back to the store value, which is what mobile does when the param is
 * absent.
 */
export default async function BookSurveyPage({ searchParams }: PageProps<'/book-survey'>) {
  const params = await searchParams;

  return (
    <BookSurveyForm
      bookingContext={asOneOf(BOOKING_CONTEXTS, params.bookingContext)}
      packageId={typeof params.packageId === 'string' ? params.packageId : undefined}
      selectedServiceType={asOneOf(ELECTRICAL_SERVICES, params.selectedServiceType)}
      selectedServiceTitle={
        typeof params.selectedServiceTitle === 'string' ? params.selectedServiceTitle : undefined
      }
    />
  );
}
