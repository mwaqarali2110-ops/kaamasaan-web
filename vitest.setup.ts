// jest-dom matchers only make sense in a DOM. Tests default to the `node`
// environment (see vitest.config.mts); component tests opt in with
// `// @vitest-environment jsdom` and get the matchers loaded here.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
}

export {};
