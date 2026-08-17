import { describe, expect, it } from 'vitest';

/**
 * Parity harness for the calculation engines ported from mobile.
 *
 * The mobile repo ships five files named `*.test.ts`, but they are not test
 * suites — each is a script with a hand-rolled `assert` helper that throws on
 * failure, self-executes at import and prints a console line. Mobile has no
 * test runner configured, so nothing ever ran them in CI.
 *
 * They were renamed to `*.scenarios.ts` (accurate: they are scenario scripts)
 * with only their trailing self-invocation removed. Every assertion body is
 * byte-identical to mobile. This file drives them through Vitest so failures
 * surface as real test failures with names, and the scenario counts are pinned
 * so a silently-skipped assertion cannot pass unnoticed.
 *
 * Source files:
 *   kaamasaan-mobile/src/utils/{activeProject,batteryRecommendation,
 *   catalogRegression,commercialRecommendation,packageEngine}.test.ts
 */
describe('ported calculation engines', () => {
  it('activeProject: selects the primary active project across 8 scenarios', async () => {
    const { runActiveProjectRegressionTests } = await import('./activeProject.scenarios');
    expect(runActiveProjectRegressionTests()).toBe(8);
  });

  it('batteryRecommendation: 7 scenarios', async () => {
    const { runBatteryRecommendationTests } = await import('./batteryRecommendation.scenarios');
    expect(runBatteryRecommendationTests()).toBe(7);
  });

  it('catalogRegression: 10 scenarios', async () => {
    const { runCatalogRegressionTests } = await import('./catalogRegression.scenarios');
    expect(runCatalogRegressionTests()).toBe(10);
  });

  it('packageEngine: 29 scenarios', async () => {
    const { runPackageEngineTests } = await import('./packageEngine.scenarios');
    expect(runPackageEngineTests()).toBe(29);
  });

  it('commercialRecommendation: customer-flow scenarios', async () => {
    // This one has no exported runner — its assertions execute at module scope,
    // so a successful import is the assertion.
    await expect(import('./commercialRecommendation.scenarios')).resolves.toBeDefined();
  });
});
