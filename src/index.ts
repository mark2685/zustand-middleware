import { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';
import { Cast, Write } from './types.ts';
import {
  computeWithSelectors,
  getStateForCompute,
  hasUpdates,
} from './utils/index.ts';

export type RulesMiddleware<U> = ['computed-rules', U];

type ComputedRulesStateCreator = <
  T extends object, // State
  U extends object, // Computed State
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ['computed-rules', U]], Mcs>,
  computeFn: (state: T) => U,
) => StateCreator<T, Mps, [['computed-rules', U], ...Mcs], T & U>;

type StoreCompute<S, U> = S extends {
  getState: () => infer T;
}
  ? Omit<StoreApi<T & U>, 'setState'>
  : never;

type WithCompute<S, U> = Write<S, StoreCompute<S, U>>;

declare module 'zustand' {
  interface StoreMutators<S, A extends object> {
    'computed-rules': WithCompute<Cast<S, object>, A>;
  }
}

type ComputedRulesImpl = <T extends object, U extends object>(
  f: StateCreator<T, [], []>,
  computeFn: (state: Partial<T>) => U,
) => StateCreator<T, [], [], T & U>;

const computedRulesImpl: ComputedRulesImpl = (f, computeFn) => {
  type T = ReturnType<typeof f>;
  type U = ReturnType<typeof computeFn>;

  const trackedSelectors = new Set<string | symbol>();

  return (set, get, api) => {
    const setStateWithComputed = (update: T | ((state: T) => T)) => {
      set((state: T) => {
        // Update can be a function if the `setState` function is called
        // directly due replacing setState with setStateWithComputed.
        let updatedState: T | null = null;

        if (typeof update === 'object') {
          updatedState = update;
        }

        if (typeof update === 'function') {
          updatedState = update(state as T);
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

        const stateToCompute = getStateForCompute<T, U>(
          state as T & U,
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

    const state = f(setStateWithComputed, get, api);

    const computedState = computeWithSelectors(
      state,
      computeFn,
      trackedSelectors,
    );

    const result = { ...state, ...computedState };

    return result;
  };
};

export const computedRules =
  computedRulesImpl as unknown as ComputedRulesStateCreator;
