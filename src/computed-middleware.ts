import { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';
import { ComputedRulesState, Write } from './types.ts';
import {
  computeWithSelectors,
  getStateForCompute,
  hasUpdates,
} from './utils/index.ts';

export type RulesMiddleware<UState> = ['computed-rules', UState];

type ComputedRules = <
  TState extends object,
  UState extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<TState, [...Mps, ['computed-rules', unknown]], Mcs>,
  computeFn: (state: TState) => UState,
) => StateCreator<
  TState,
  Mps,
  [['computed-rules', StoreApi<ComputedRulesState<TState, UState>>], ...Mcs]
>;

declare module 'zustand' {
  interface StoreMutators<S, A> {
    'computed-rules': Write<S, A>;
  }
}

export const computedRules = (<TState extends object, UState extends object>(
  config: StateCreator<TState, [], []>,
  computeFn: (state: Partial<TState>) => UState,
): StateCreator<TState, [], [], TState & UState> => {
  const trackedSelectors = new Set<string | symbol>();

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

        if (
          trackedSelectors.size === 0 ||
          !hasUpdates(updatedState, trackedSelectors)
        ) {
          return updatedState;
        }

        const stateToCompute = getStateForCompute<TState, UState>(
          state as TState & UState,
          updatedState,
          trackedSelectors,
        );

        const computedState = computeFn(stateToCompute);

        return { ...updatedState, ...computedState };
      });
    };

    // Update setState to use our setStateWithComputed to ensure values are
    // propertly updated.
    api.setState = setStateWithComputed;

    const state = config(setStateWithComputed, get, api);

    const computedState = computeWithSelectors(
      state,
      computeFn,
      trackedSelectors,
    );

    const result = { ...state, ...computedState };

    return result;
  };
}) as unknown as ComputedRules;
