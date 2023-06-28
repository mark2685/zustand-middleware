import isEqual from 'lodash.isequal';

/**
 * Returns true if updated state differes from original state.
 */
export const hasUpdates = <TState extends object>(
  state: TState,
  updatedState: Partial<TState>,
): boolean => {
  for (const key in updatedState) {
    if (!isEqual(state[key], updatedState[key])) {
      return true;
    }
  }

  return false;
};
