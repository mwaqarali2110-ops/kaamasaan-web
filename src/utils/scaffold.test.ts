import { describe, expect, it } from 'vitest';
import { routes, slugToDesignStep, designSteps } from '@/constants/routes';
import { colors } from '@/constants/colors';

/**
 * Scaffold smoke tests. Replaced in Phase 2 by the real engine tests ported
 * from kaamasaan-mobile/src/utils/*.test.ts.
 */
describe('scaffold', () => {
  it('builds routes with search params', () => {
    expect(routes.home()).toBe('/');
    expect(routes.productDetail('abc')).toBe('/marketplace/product/abc');
    expect(routes.login({ redirectTo: '/book-survey' })).toBe('/login?redirectTo=%2Fbook-survey');
    expect(routes.design('roof')).toBe('/design/roof');
  });

  it('maps every design step slug back to its mobile step name', () => {
    // The wizard order must match `designSystemSteps` in
    // kaamasaan-mobile/src/store/useSystemStore.ts.
    expect(designSteps.map((slug) => slugToDesignStep[slug])).toEqual([
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

  it('keeps the brand palette identical to mobile', () => {
    expect(colors.cream).toBe('#FFF7E6');
    expect(colors.navy).toBe('#10243C');
    expect(colors.yellow).toBe('#FACC15');
  });
});
