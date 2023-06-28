import { NewBooleanRule, NewRule } from 'rules-engine-ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { RuleList } from './types';
import { rulesEngine } from './index';

type SimpleStore = {
  count: number;
  untracked_value: number;
  inc: () => void;
  dec: () => void;
};

const simpleRuleRoots: RuleList<{ rule_01: NewRule }> = {
  rule_01: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'count',
        operator: 'greater_than_or_equal_to',
        value: 10,
      },
    ],
  },
};

describe('computed rules middleware with simple rules', () => {
  const makeStore = () =>
    create<SimpleStore>()(
      rulesEngine(
        (set) => ({
          count: 1,
          untracked_value: 0,
          inc: () => set((state) => ({ count: state.count + 1 })),
          dec: () => set((state) => ({ count: state.count - 1 })),
        }),
        simpleRuleRoots,
      ),
    );

  let useStore: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = makeStore();
  });

  it('should compute the rules for initial state', () => {
    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().rules.rule_01).toEqual(false);
  });

  it('should compute the rules for updated state', () => {
    useStore.getState().inc();

    expect(useStore.getState().count).toEqual(2);
    expect(useStore.getState().rules.rule_01).toEqual(false);

    useStore.setState({ count: 10 });

    expect(useStore.getState().rules.rule_01).toEqual(true);

    useStore.getState().dec();

    expect(useStore.getState().rules.rule_01).toEqual(false);
  });

  it('should not modify object reference if unchanged', () => {
    useStore.setState({ count: 4 });

    expect(useStore.getState().count).toEqual(4);

    const obj = useStore.getState();
    useStore.setState({ count: 4 });

    const toCompare = useStore.getState();

    expect(obj).toBe(toCompare);
  });

  it('should not change the rules state if tracked values are not changed', () => {
    const obj = useStore.getState().rules;

    useStore.setState({ untracked_value: 2 });

    const toCompare = useStore.getState().rules;

    expect(obj).toBe(toCompare);
  });
});

describe('computed rules with middleware', () => {
  const makeStore = () =>
    create<SimpleStore>()(
      devtools(
        rulesEngine(
          immer((set) => ({
            count: 1,
            untracked_value: 0,
            inc: () =>
              set((state) => {
                state.count = state.count + 1;
              }),
            dec: () =>
              set((state) => {
                state.count = state.count - 1;
              }),
          })),
          simpleRuleRoots,
        ),
      ),
    );

  let useStore: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = makeStore();
  });

  it('should compute the initial state', () => {
    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().rules.rule_01).toEqual(false);
  });

  it('should compute the rules for updated state', () => {
    useStore.getState().inc();

    expect(useStore.getState().count).toEqual(2);
    expect(useStore.getState().rules.rule_01).toEqual(false);

    useStore.setState({ count: 10 });

    expect(useStore.getState().rules.rule_01).toEqual(true);

    useStore.getState().dec();

    expect(useStore.getState().rules.rule_01).toEqual(false);
  });
});

type Level = {
  pointsNeeded: number;
};

type LevelList = { [level: number]: Level };

const levelList: LevelList = {
  1: { pointsNeeded: 10 },
  2: { pointsNeeded: 20 },
  3: { pointsNeeded: 30 },
  4: { pointsNeeded: 40 },
  5: { pointsNeeded: 50 },
};

type MultipleRuleRoots = RuleList<{
  levelOneComplete: NewRule;
  levelTwoComplete: NewRule;
  levelThreeComplete: NewRule;
  levelFourComplete: NewRule;
  levelFiveComplete: NewRule;
  gameComplete: NewBooleanRule;
}>;

const multipleRuleRoots: MultipleRuleRoots = {
  levelOneComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 10,
      },
    ],
  },
  levelTwoComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 20,
      },
    ],
  },
  levelThreeComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 30,
      },
    ],
  },
  levelFourComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 40,
      },
    ],
  },
  levelFiveComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 50,
      },
    ],
  },
  gameComplete: {
    connector: 'and',
    rules: [
      {
        type: 'number',
        field: 'points',
        operator: 'greater_than_or_equal_to',
        value: 50,
      },
      {
        type: 'boolean',
        field: 'beatFinalBoss',
        operator: 'is_true',
      },
    ],
  },
};

type AdvancedStore = {
  points: number;
  levelList: LevelList;
  incPoints: () => void;
  decPoints: () => void;
  fightFinalBoss: (points: number) => void;
};

describe('computed rules middleware with multiple rules', () => {
  const bossPointsNeeded = 100;

  const makeStore = () =>
    create<AdvancedStore>()(
      rulesEngine(
        (set) => ({
          points: 0,
          levelList,
          beatFinalBoss: false,
          incPoints: () => set((state) => ({ points: state.points + 1 })),
          decPoints: () => set((state) => ({ points: state.points - 1 })),
          fightFinalBoss: (points: number) =>
            set((state) => ({
              points: state.points + points,
              beatFinalBoss: points >= bossPointsNeeded,
            })),
        }),
        multipleRuleRoots,
      ),
    );

  let useStore: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = makeStore();
  });

  it('should compute the rules for initial state', () => {
    expect(useStore.getState().points).toEqual(0);
    expect(useStore.getState().rules.levelOneComplete).toEqual(false);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(false);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(false);
    expect(useStore.getState().rules.levelFourComplete).toEqual(false);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(false);
    expect(useStore.getState().rules.gameComplete).toEqual(false);
  });

  it('should compute the rules for updated state', () => {
    useStore.setState({ points: 10 });

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(false);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(false);
    expect(useStore.getState().rules.levelFourComplete).toEqual(false);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(false);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.setState({ points: 20 });

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(false);
    expect(useStore.getState().rules.levelFourComplete).toEqual(false);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(false);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.setState({ points: 30 });

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(true);
    expect(useStore.getState().rules.levelFourComplete).toEqual(false);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(false);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.setState({ points: 40 });

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(true);
    expect(useStore.getState().rules.levelFourComplete).toEqual(true);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(false);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.setState({ points: 50 });

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(true);
    expect(useStore.getState().rules.levelFourComplete).toEqual(true);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(true);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.getState().fightFinalBoss(99);

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(true);
    expect(useStore.getState().rules.levelFourComplete).toEqual(true);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(true);
    expect(useStore.getState().rules.gameComplete).toEqual(false);

    useStore.getState().fightFinalBoss(102);

    expect(useStore.getState().rules.levelOneComplete).toEqual(true);
    expect(useStore.getState().rules.levelTwoComplete).toEqual(true);
    expect(useStore.getState().rules.levelThreeComplete).toEqual(true);
    expect(useStore.getState().rules.levelFourComplete).toEqual(true);
    expect(useStore.getState().rules.levelFiveComplete).toEqual(true);
    expect(useStore.getState().rules.gameComplete).toEqual(true);
  });
});
