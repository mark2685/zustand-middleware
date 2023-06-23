import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { computed } from './index.ts';

type Store = {
  count: number;
  x: number;
  y: number;
  inc: () => void;
  dec: () => void;
};

type ComputedStore = {
  countSq: number;
  nestedResult: {
    stringified: string;
  };
};

function computeRules(state: Store): ComputedStore {
  const nestedResult = {
    stringified: JSON.stringify(state.count),
  };

  return {
    countSq: state.count ** 2,
    nestedResult,
  };
}

describe('computed rules middleware simple', () => {
  const computeStateMock = vi.fn(computeRules);

  const makeStore = () =>
    create<Store>()(
      computed(
        (set) => ({
          count: 1,
          x: 1,
          y: 1,
          inc: () => set((state) => ({ count: state.count + 1 })),
          dec: () => set((state) => ({ count: state.count - 1 })),
        }),
        computeStateMock,
      ),
    );

  let useStore: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = makeStore();
  });

  it('should compute the initial state', () => {
    expect(computeStateMock).toHaveBeenCalledTimes(1);
    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().countSq).toEqual(1);
  });

  it('should compute the updated state', () => {
    useStore.getState().inc();

    expect(computeStateMock).toHaveBeenCalledTimes(2);
    expect(useStore.getState().count).toEqual(2);
    expect(useStore.getState().countSq).toEqual(4);

    useStore.getState().dec();

    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().countSq).toEqual(1);
    expect(computeStateMock).toHaveBeenCalledTimes(3);

    useStore.setState({ count: 4 });

    expect(useStore.getState().count).toEqual(4);
    expect(useStore.getState().countSq).toEqual(16);
    expect(computeStateMock).toHaveBeenCalledTimes(4);
  });

  it('should not modify object reference if unchanged', () => {
    useStore.setState({ count: 4 });

    expect(useStore.getState().count).toEqual(4);

    const obj = useStore.getState().nestedResult;
    useStore.setState({ count: 4 });
    const toCompare = useStore.getState().nestedResult;

    expect(obj).toEqual(toCompare);
  });

  it('should not call the compute function if state not used in computeFn is modified', () => {
    expect(computeStateMock).toHaveBeenCalledTimes(1);

    useStore.setState({ x: 2 });

    expect(computeStateMock).toHaveBeenCalledTimes(1);

    useStore.setState({ x: 3 });

    expect(computeStateMock).toHaveBeenCalledTimes(1);

    useStore.setState({ y: 2 });

    expect(computeStateMock).toHaveBeenCalledTimes(1);
  });
});

describe('computed rules with middleware', () => {
  const computeStateMock = vi.fn(computeRules);

  const makeStore = () =>
    create<Store>()(
      devtools(
        computed(
          immer((set) => ({
            count: 1,
            x: 1,
            y: 1,
            inc: () =>
              set((state) => {
                state.count = state.count + 1;
              }),
            dec: () =>
              set((state) => {
                state.count = state.count - 1;
              }),
          })),
          computeStateMock,
        ),
      ),
    );

  let useStore: ReturnType<typeof makeStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = makeStore();
  });

  it('should compute the initial state', () => {
    expect(computeStateMock).toHaveBeenCalledTimes(1);
    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().countSq).toEqual(1);
  });

  it('should compute the updated state', () => {
    useStore.getState().inc();

    expect(computeStateMock).toHaveBeenCalledTimes(2);
    expect(useStore.getState().count).toEqual(2);
    expect(useStore.getState().countSq).toEqual(4);

    useStore.getState().dec();

    expect(useStore.getState().count).toEqual(1);
    expect(useStore.getState().countSq).toEqual(1);
    expect(computeStateMock).toHaveBeenCalledTimes(3);

    useStore.setState({ count: 4 });

    expect(useStore.getState().count).toEqual(4);
    expect(useStore.getState().countSq).toEqual(16);
    expect(computeStateMock).toHaveBeenCalledTimes(4);
  });
});
