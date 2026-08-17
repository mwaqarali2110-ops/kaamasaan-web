/**
 * Every step renders its own `WizardShell` so it can own its footer CTA and
 * summary sidebar, exactly as mobile's step screens own their bottom panel.
 * The route only decides *which* step to render and supplies the navigation
 * callbacks.
 */
export type StepProps = {
  /** Advance, applying the step's own validation gate first. */
  onContinue: () => void;
  /** Go to the previous step, or leave the wizard from step 1. */
  onBack: () => void;
};
