import { describe, expect, it } from 'vitest';
import {
  designSystemSteps,
  furthestAllowedStep,
  getInverterSizeKw,
  isStepAllowed,
  previousStep,
  toSlug,
  toStep
} from './wizard';

/**
 * Locks the wizard's navigation rules to mobile's behaviour in
 * kaamasaan-mobile/.../DesignSystemFlowScreen.tsx.
 *
 * These are cheap to get subtly wrong when the step lives in the URL instead of
 * component state — particularly the backup branch, where declining a battery
 * must skip two steps in both directions.
 */
describe('wizard step order', () => {
  it('matches the store definition exactly', () => {
    expect([...designSystemSteps]).toEqual([
      'appliances',
      'solar',
      'roof',
      'backupNeed',
      'backupAppliances',
      'backupPlan',
      'recommended',
      'packages'
    ]);
  });

  it('round-trips every step through its URL slug', () => {
    for (const step of designSystemSteps) {
      expect(toStep(toSlug(step))).toBe(step);
    }
  });

  it('rejects unknown slugs', () => {
    expect(toStep('nope')).toBeNull();
    expect(toStep('backupNeed')).toBeNull(); // camelCase is not the URL form
    expect(toStep('backup-need')).toBe('backupNeed');
  });
});

describe('previousStep', () => {
  it('returns null from the first step so the wizard exits', () => {
    expect(previousStep('appliances', true)).toBeNull();
  });

  it('walks back one step when backup was chosen', () => {
    expect(previousStep('packages', true)).toBe('recommended');
    expect(previousStep('recommended', true)).toBe('backupPlan');
    expect(previousStep('backupPlan', true)).toBe('backupAppliances');
    expect(previousStep('backupAppliances', true)).toBe('backupNeed');
  });

  it('skips the two backup steps when backup was declined', () => {
    // Mobile's forward branch jumps backupNeed -> recommended, so back must
    // return to backupNeed rather than a step that was never shown.
    expect(previousStep('recommended', false)).toBe('backupNeed');
  });
});

describe('step guarding', () => {
  it('pins an unstarted design to step 1', () => {
    const progress = { lastDesignStep: 'packages' as const, designStarted: false };
    expect(furthestAllowedStep(progress)).toBe('appliances');
    expect(isStepAllowed('appliances', progress)).toBe(true);
    expect(isStepAllowed('solar', progress)).toBe(false);
  });

  it('allows every step up to the furthest reached', () => {
    const progress = { lastDesignStep: 'roof' as const, designStarted: true };
    expect(isStepAllowed('appliances', progress)).toBe(true);
    expect(isStepAllowed('solar', progress)).toBe(true);
    expect(isStepAllowed('roof', progress)).toBe(true);
    expect(isStepAllowed('backupNeed', progress)).toBe(false);
    expect(isStepAllowed('packages', progress)).toBe(false);
  });
});

describe('getInverterSizeKw', () => {
  it('floors at 3 kW and rounds up, matching mobile', () => {
    expect(getInverterSizeKw(0)).toBe(0);
    expect(getInverterSizeKw(1)).toBe(3);
    expect(getInverterSizeKw(3)).toBe(3);
    expect(getInverterSizeKw(5.1)).toBe(6);
    expect(getInverterSizeKw(10)).toBe(10);
  });
});
