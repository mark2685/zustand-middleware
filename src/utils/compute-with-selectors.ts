/**
 * Initial compute that determines selectors used to determine whether futures
 * state updates need to be calculated.
 */
export const computeWithSelectors = <T extends object, U extends object>(
  state: T,
  computeFn: (state: T) => U,
  trackedSelectors: Set<string | symbol>,
): U => {
  const proxyState = new Proxy(
    { ...state },
    {
      get: (target, prop, receiver) => {
        trackedSelectors.add(prop);

        return Reflect.get(target, prop, receiver);
      },
    },
  );

  return computeFn(proxyState);
};
