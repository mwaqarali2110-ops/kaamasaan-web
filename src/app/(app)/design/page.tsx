import { redirect } from 'next/navigation';
import { routes } from '@/constants/routes';

/** `/design` enters the wizard at step 1; `DesignWizard` resumes from there. */
export default function DesignIndexPage() {
  redirect(routes.design('appliances'));
}
