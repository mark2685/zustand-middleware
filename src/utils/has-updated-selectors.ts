/**
 * Returns true if updated state includes keys from tracked selectors.
 */
export const hasUpdatedSelectors = <TState extends object>(
  updatedState: Partial<TState>,
  selectors: Set<string>,
): boolean => {
  return Object.keys(updatedState).some((k) => selectors.has(k));
};
