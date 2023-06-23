/**
 * Returns true if updated state includes keys from tracked selectors.
 */
export const hasUpdates = <T extends object>(
  updatedState: Partial<T>,
  selectors: Set<string | symbol>,
): boolean => {
  return Object.keys(updatedState).some((k) => selectors.has(k));
};
