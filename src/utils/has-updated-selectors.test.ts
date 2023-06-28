import { describe, expect, it } from 'vitest';
import { hasUpdatedSelectors } from './has-updated-selectors';

describe('hasUpdatedSelectors', () => {
  const trackedSelectors = new Set(['tracked_1', 'tracked_2']);

  it('returns true if updated state includes keys from tracked selectors', () => {
    const updatedState = { tracked_1: 'foo' };

    expect(hasUpdatedSelectors(updatedState, trackedSelectors)).toBe(true);
  });

  it('returns false if updated state does not include keys from tracked selectors', () => {
    const updatedState = { foo: 'bar' };

    expect(hasUpdatedSelectors(updatedState, trackedSelectors)).toBe(false);
  });
});
