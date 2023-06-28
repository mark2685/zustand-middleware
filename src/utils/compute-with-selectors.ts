import { ComputeRules, RulesState } from '@/types';

/**
 * Utilizes Proxy during initial compute to create tracked selectors used to
 * determine whether future state updates need to be re-computed.
 */
export const computeWithSelectors = <
  TState extends object,
  UState extends object,
>(
  state: TState,
  ruleEngineRoots: ComputeRules<UState>,
  computeFn: (roots: ComputeRules<UState>, state: TState) => RulesState<UState>,
  trackedSelectors: Set<string | symbol>,
): Record<keyof UState, boolean> => {
  const proxyState = new Proxy(
    { ...state },
    {
      get: (target, prop, receiver) => {
        trackedSelectors.add(prop);

        return Reflect.get(target, prop, receiver);
      },
    },
  );

  return computeFn(ruleEngineRoots, proxyState);
};
