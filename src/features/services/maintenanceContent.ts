/**
 * Marketing packages shown on the Maintenance Packages screen, ported verbatim
 * from kaamasaan-mobile/src/mobile/screens/services/MaintenancePackagesScreen.tsx.
 *
 * ⚠️ These are NOT the bookable plans. Mobile has two separate sets:
 *
 *   - `src/data/maintenancePlans.ts` — Essential 15,000 / Standard 7,999 /
 *     Premium 20,000. These are real `MaintenancePlanSelection` records that
 *     drive the booking flow and the Premium Care lifecycle.
 *   - the list below — Basic 2,500 / Smart 5,500 / Complete 9,900, whose CTA
 *     just navigates to a general Book Survey without selecting a plan.
 *
 * The prices contradict each other and a customer could see both. That is
 * mobile's behaviour and is reproduced here rather than silently reconciled,
 * but it is flagged in docs/PORTING_LOG.md as something to resolve on the
 * product side.
 */
export const maintenancePackages: Array<{
  id: string;
  title: string;
  price: string;
  recommended?: boolean;
  features: string[];
}> = [
  {
    id: 'basic',
    title: 'Basic Care',
    price: '2,500',
    features: [
      'Panel cleaning',
      'Visual panel inspection',
      'Generation check',
      'Basic health report'
    ]
  },
  {
    id: 'smart',
    title: 'Smart Care',
    price: '5,500',
    recommended: true,
    features: [
      'Thermal panel inspection',
      'DC wiring tightening',
      'MC4 connector check',
      'Earthing verification',
      'Inverter diagnostics',
      'Detailed health report'
    ]
  },
  {
    id: 'complete',
    title: 'Complete Solar Care',
    price: '9,900',
    features: [
      'Everything in Smart Care',
      'Battery full inspection',
      'Performance optimization',
      'Full preventive report',
      'Priority support (7 days)',
      'Follow-up check call'
    ]
  }
];

export const trustItems = ['Certified Technicians', 'PKR Fixed Price', '30-Day Guarantee'];
