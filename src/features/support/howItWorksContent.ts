/**
 * Ported verbatim from `journeySteps` in
 * kaamasaan-mobile/src/mobile/screens/support/HowItWorksScreen.tsx.
 */
export type JourneyStepPreview =
  | 'appliances'
  | 'solar'
  | 'panel'
  | 'backup'
  | 'battery'
  | 'packages'
  | 'survey'
  | 'tracking';

export type JourneyStep = {
  step: string;
  title: string;
  description: string;
  label: string;
  preview: JourneyStepPreview;
};

export const journeySteps: JourneyStep[] = [
  {
    step: 'Step 1',
    title: 'Select your day load',
    description:
      'Choose the appliances you use during the day so KaamAsaan can calculate your running load.',
    label: 'Day Load',
    preview: 'appliances'
  },
  {
    step: 'Step 2',
    title: 'Get solar size recommendation',
    description:
      'KaamAsaan recommends the ideal solar system size based on your daytime load and estimated production.',
    label: 'Solar Size',
    preview: 'solar'
  },
  {
    step: 'Step 3',
    title: 'View panel layout',
    description:
      'See how many panels are required, roof space needed, dimensions, and landscape/portrait layout.',
    label: 'Panel Layout',
    preview: 'panel'
  },
  {
    step: 'Step 4',
    title: 'Choose backup load',
    description: 'Select the appliances you want to run on battery backup and choose backup hours.',
    label: 'Backup Load',
    preview: 'backup'
  },
  {
    step: 'Step 5',
    title: 'Get battery recommendation',
    description: 'KaamAsaan recommends battery size based on running load and selected backup hours.',
    label: 'Battery Size',
    preview: 'battery'
  },
  {
    step: 'Step 6',
    title: 'Compare recommended packages',
    description: 'View suitable packages with inverter, panels, battery, pricing, and brand options.',
    label: 'Packages',
    preview: 'packages'
  },
  {
    step: 'Step 7',
    title: 'Book site survey',
    description:
      'Choose a survey date and submit contact/address details. Our team will call to confirm timing.',
    label: 'Survey Booking',
    preview: 'survey'
  },
  {
    step: 'Step 8',
    title: 'Track your project',
    description:
      'After survey booking, track confirmation, progress, installation, and support from My Project.',
    label: 'Project Tracking',
    preview: 'tracking'
  }
];
