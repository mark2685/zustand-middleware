import {
  Mutate,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from 'zustand';
import { Cast, RuleList, RulesState, Write } from '@/types';
import {
  computeRules,
  computeWithSelectors,
  createComputeRules,
  hasUpdatedSelectors,
  hasUpdates,
} from '@/utils';

type StoreCompute<S, A> = S extends {
  getState: () => infer T;
}
  ? Omit<StoreApi<T & A>, 'setState'>
  : never;
type WithCompute<S, A> = Write<S, StoreCompute<S, A>>;

type ComputedRules = <
  TState extends Omit<object, 'rules'>,
  UState extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<TState, [...Mps, ['rules', RulesState<UState>]], Mcs>,
  ruleRoots: RuleList<UState>,
) => StateCreator<
  TState,
  Mps,
  [['rules', RulesState<UState>], ...Mcs],
  TState & { rules: RulesState<UState> }
>;

declare module 'zustand' {
  interface StoreMutators<S, A> {
    rules: WithCompute<Cast<S, object>, { rules: RulesState<A> }>;
  }
}

export const rulesEngine = (<TState extends object, UState extends object>(
  config: StateCreator<TState, [], []>,
  ruleRoots: RuleList<UState>,
): StateCreator<TState, [], [], TState & { rules: RulesState<UState> }> => {
  const trackedSelectors = new Set<string>();

  const ruleEngineRoots = createComputeRules(ruleRoots);

  return (set, get, api) => {
    const setStateWithComputed = (
      update: TState | ((state: TState) => TState),
    ) => {
      set((state: TState) => {
        // Update can be a function if the `setState` function is called
        // directly due replacing setState with setStateWithComputed.
        let updatedState: TState | null = null;

        if (typeof update === 'object') {
          updatedState = update;
        }

        if (typeof update === 'function') {
          updatedState = update(state as TState);
        }

        if (!updatedState) {
          throw new Error('update is invalid.');
        }

        if (!hasUpdates(state, updatedState)) {
          return state;
        }

        if (
          trackedSelectors.size === 0 ||
          !hasUpdatedSelectors(updatedState, trackedSelectors)
        ) {
          return updatedState;
        }

        const computedRules = computeWithSelectors(
          { ...state, ...updatedState },
          ruleEngineRoots,
          computeRules,
          trackedSelectors,
        );

        const result = { ...updatedState, rules: computedRules };

        return result;
      });
    };

    const _api = api as Mutate<
      StoreApi<TState>,
      [['rules', { rules: RulesState<UState> }]]
    >;

    // Update setState to use our setStateWithComputed to ensure values are
    // propertly updated.
    _api.setState = setStateWithComputed;

    const state = config(setStateWithComputed, get, _api);

    const computedRules = computeWithSelectors(
      state,
      ruleEngineRoots,
      computeRules,
      trackedSelectors,
    );

    const result = { ...state, rules: computedRules };

    return result;
  };
}) as unknown as ComputedRules;
