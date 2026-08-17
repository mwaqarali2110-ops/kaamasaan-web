/** Minimal className joiner. Keeps the dependency list close to mobile's. */
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');
