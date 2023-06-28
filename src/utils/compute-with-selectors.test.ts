import { NewRule } from 'rules-engine-ts';
import { beforeEach, describe, expect, it } from 'vitest';
import { RuleList } from '@/types';
import { computeWithSelectors } from './compute-with-selectors';
import { computeRules, createComputeRules } from './create-compute-rules';

type State = {
  tracked_1: number;
  tracked_2: number;
  non_tracked_1: number;
};

const state: State = {
  tracked_1: 1,
  tracked_2: 1,
  non_tracked_1: 1,
};

const simpleRules: RuleList<{ rule_01: NewRule }> = {
  rule_01: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'tracked_1',
        operator: 'greater_than_or_equal_to',
        value: 2,
      },
      {
        type: 'number',
        field: 'tracked_2',
        operator: 'greater_than_or_equal_to',
        value: 2,
      },
    ],
  },
};

const simpleRuleRoots = createComputeRules(simpleRules);

const trackedSelectors = new Set<string | symbol>();

describe('computeWithSelectors', () => {
  beforeEach(() => {
    trackedSelectors.clear();
  });

  it('returns the computed state', () => {
    expect(
      computeWithSelectors(
        state,
        simpleRuleRoots,
        computeRules,
        trackedSelectors,
      ),
    ).toEqual({
      rule_01: false,
    });
  });

  it('updates tracked selectors with keys used in computeFn', () => {
    expect(
      computeWithSelectors(
        state,
        simpleRuleRoots,
        computeRules,
        trackedSelectors,
      ),
    ).toEqual({
      rule_01: false,
    });
    expect(trackedSelectors.has('tracked_1')).toBe(true);
    expect(trackedSelectors.has('tracked_2')).toBe(false);
    expect(trackedSelectors.has('non_tracked_1')).toBe(false);

    expect(
      computeWithSelectors(
        { ...state, tracked_1: 2 },
        simpleRuleRoots,
        computeRules,
        trackedSelectors,
      ),
    ).toEqual({
      rule_01: false,
    });

    expect(trackedSelectors.has('tracked_1')).toBe(true);
    expect(trackedSelectors.has('tracked_2')).toBe(true);
    expect(trackedSelectors.has('non_tracked_1')).toBe(false);

    expect(
      computeWithSelectors(
        { ...state, tracked_1: 2, tracked_2: 2 },
        simpleRuleRoots,
        computeRules,
        trackedSelectors,
      ),
    ).toEqual({
      rule_01: true,
    });
    expect(trackedSelectors.has('tracked_1')).toBe(true);
    expect(trackedSelectors.has('tracked_2')).toBe(true);
    expect(trackedSelectors.has('non_tracked_1')).toBe(false);
  });
});
