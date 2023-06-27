import { RootUnion } from 'rules-engine-ts';

export type ComputedRulesState<TState, UState> = Omit<TState, keyof UState> &
  UState;

export type Write<T, U> = Omit<T, keyof U> & U;

export type RuleList<U extends object> = {
  name: keyof U;
  rules: RootUnion;
}[];
