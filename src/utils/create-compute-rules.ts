import { RootUnion, addRulesToUnion, createRoot, run } from 'rules-engine-ts';
import { ComputeRules, RuleList, RulesState } from '@/types';

export const createComputeRules = <UState>(
  ruleList: RuleList<UState>,
): Record<keyof UState, RootUnion> => {
  const roots = {} as ComputeRules<UState>;

  for (const name in ruleList) {
    const { connector, rules } = ruleList[name];

    roots[name] = createRoot({ connector }) as RootUnion;

    addRulesToUnion(roots[name], rules);
  }

  return roots;
};

export const computeRules = <TState extends object, UState extends object>(
  roots: ComputeRules<UState>,
  state: Partial<TState>,
): RulesState<UState> => {
  const computed = {} as RulesState<UState>;

  for (const i in roots) {
    const current = roots[i];

    const result = run(current, state);

    computed[i] = result;
  }

  return computed as RulesState<UState>;
};
