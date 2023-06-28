import { describe, expect, it } from 'vitest';
import { hasUpdates } from './has-updates';

describe('hasUpdates', () => {
  it('returns false if updated state does not have updated values', () => {
    const state = { tracked_1: 'foo', tracked_2: 'bar' };
    const updatedState = { tracked_1: 'foo' };

    expect(hasUpdates(state, updatedState)).toBe(false);
  });

  it('returns true if updated state does have updated values', () => {
    const state = { tracked_1: 'foo', tracked_2: 'bar' };
    const updatedState = { tracked_1: 'baz' };

    expect(hasUpdates(state, updatedState)).toBe(true);
  });
});
