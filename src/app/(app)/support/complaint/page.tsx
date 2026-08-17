import type { Metadata } from 'next';
import { ComplaintForm } from '@/features/support/ComplaintForm';

export const metadata: Metadata = { title: 'Raise a Complaint' };

export default function ComplaintPage() {
  return <ComplaintForm />;
}
