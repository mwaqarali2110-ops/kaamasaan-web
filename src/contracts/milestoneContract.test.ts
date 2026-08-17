import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The solar-journey milestone list is a contract shared with the database
 * (survey_bookings.current_milestone). `src/contracts/solarJourneyMilestones.ts`
 * is a vendored copy of the backend file — vendored because mobile imports it
 * through a relative path that escapes its own project root, which would make
 * this app impossible to build standalone.
 *
 * Copies drift. This fails loudly if the backend version changes, so the copy
 * gets refreshed instead of silently disagreeing with the database.
 */
const BACKEND_CONTRACT = join(
  process.cwd(),
  '..',
  'backend-development',
  'supabase',
  'contracts',
  'solarJourneyMilestones.ts'
);

const VENDORED = join(process.cwd(), 'src', 'contracts', 'solarJourneyMilestones.ts');

const readSafely = (path: string) => {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
};

/** Compare the code only — the vendored copy carries an extra header comment. */
const stripLeadingBlockComment = (source: string) =>
  source.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '').trim();

describe('solar journey milestone contract', () => {
  it('the vendored copy matches the backend source', () => {
    const backend = readSafely(BACKEND_CONTRACT);
    const vendored = readSafely(VENDORED);

    expect(vendored, 'vendored contract is missing').not.toBeNull();

    if (backend === null) {
      // Standalone checkout without the sibling backend folder — nothing to
      // compare against, and that is exactly the situation vendoring supports.
      return;
    }

    expect(stripLeadingBlockComment(vendored!)).toBe(stripLeadingBlockComment(backend));
  });
});
