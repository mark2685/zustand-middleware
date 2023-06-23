import { beforeEach, describe, expect, it } from 'vitest';
import { computeWithSelectors } from './compute-with-selectors.ts';

type State = { tracked_1: number; tracked_2: number; non_tracked_1: number };

const state: State = {
  tracked_1: 1,
  tracked_2: 1,
  non_tracked_1: 1,
};

const computeFn = (state: State): { sum: number } => {
  return { sum: state.tracked_1 + state.tracked_2 };
};

const trackedSelectors = new Set<string | symbol>();

describe('computeWithSelectors', () => {
  beforeEach(() => {
    trackedSelectors.clear();
  });

  it('returns the computed state', () => {
    expect(computeWithSelectors(state, computeFn, trackedSelectors)).toEqual({
      sum: 2,
    });
  });

  it('updates tracked selectors with keys used in computeFn', () => {
    computeWithSelectors(state, computeFn, trackedSelectors);

    expect(trackedSelectors.has('tracked_1')).toBe(true);
    expect(trackedSelectors.has('tracked_2')).toBe(true);
  });

  it('does not update tracked selectors with keys not used in computeFn', () => {
    computeWithSelectors(state, computeFn, trackedSelectors);

    expect(trackedSelectors.has('non_tracked_1')).toBe(false);
    expect(trackedSelectors.has('sum')).toBe(false);
  });
});
