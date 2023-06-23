import pickBy from 'lodash.pickby';

/**
 * Returns the state required for computeFn based on tracked selectors
 */
export const getStateForCompute = <T extends object, U extends object>(
  state: T & U,
  updatedState: Partial<T>,
  selectors: Set<string | symbol>,
): Partial<T> => {
  return pickBy(
    { ...state, ...updatedState },
    selectors.values(),
  ) as Partial<T>;
};
