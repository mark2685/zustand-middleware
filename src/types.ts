import { NewRule, RootUnion } from 'rules-engine-ts';

export type Cast<T, U> = T extends U ? T : U;

export type Write<T, U> = Omit<T, keyof U> & U;

export type RuleList<UState> = {
  [K in keyof UState]: {
    connector: 'and' | 'or';
    rules: NewRule[];
  };
};

export type RulesState<UState> = {
  [K in keyof UState]: boolean;
};

export type ComputeRules<UState> = {
  [K in keyof UState]: RootUnion;
};
