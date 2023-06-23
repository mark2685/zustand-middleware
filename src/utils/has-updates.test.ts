import { describe, expect, it } from 'vitest';
import { hasUpdates } from './has-updates.ts';

describe('hasUpdates', () => {
  const trackedSelectors = new Set(['tracked_1', 'tracked_2']);

  it('returns true if updated state includes keys from tracked selectors', () => {
    const updatedState = { tracked_1: 'foo' };

    expect(hasUpdates(updatedState, trackedSelectors)).toBe(true);
  });

  it('returns false if updated state does not include keys from tracked selectors', () => {
    const updatedState = { foo: 'bar' };

    expect(hasUpdates(updatedState, trackedSelectors)).toBe(false);
  });
});
