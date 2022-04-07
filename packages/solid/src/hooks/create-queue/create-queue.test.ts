import { createQueue } from ".";

describe("createQueue", () => {
  it("correctly distributes initial values when limit is not reached", () => {
    const { state } = createQueue({ initialValues: [1], limit: 2 });

    expect(state.current).toStrictEqual([1]);
    expect(state.queue).toStrictEqual([]);
  });

  it("correctly distributes initial values when limit is reached", () => {
    const { state } = createQueue({ initialValues: [1, 2, 3, 4, 5], limit: 2 });

    expect(state.current).toStrictEqual([1, 2]);
    expect(state.queue).toStrictEqual([3, 4, 5]);
  });

  it("adds items to the state when limit is not reached", () => {
    const { state, add } = createQueue({ initialValues: [1], limit: 2 });

    add(2);

    expect(state.current).toStrictEqual([1, 2]);
    expect(state.queue).toStrictEqual([]);
  });

  it("adds items to the queue when limit is reached", () => {
    const { state, add } = createQueue({ initialValues: [1, 2], limit: 2 });

    add(3, 4, 5);

    expect(state.current).toStrictEqual([1, 2]);
    expect(state.queue).toStrictEqual([3, 4, 5]);
  });

  it("correctly applies given update to state without queue", () => {
    const { state, update } = createQueue({ initialValues: [1, 2], limit: 3 });

    update(state => state.filter(i => i % 2));

    expect(state.current).toStrictEqual([1]);
    expect(state.queue).toStrictEqual([]);
  });

  it("correctly applies given update to state with queue", () => {
    const { state, update } = createQueue({ initialValues: [1, 2, 3, 4, 5, 6, 7, 8], limit: 3 });

    update(state => state.filter(i => i % 2));

    expect(state.current).toStrictEqual([1, 3, 5]);
    expect(state.queue).toStrictEqual([7]);
  });

  it("puts extra items to the queue if state has extra items after update", () => {
    const { state, update } = createQueue<number>({ initialValues: [], limit: 3 });

    update(() => [1, 2, 3, 4, 5, 6, 7, 8]);

    expect(state.current).toStrictEqual([1, 2, 3]);
    expect(state.queue).toStrictEqual([4, 5, 6, 7, 8]);
  });

  it("cleans queue with cleanQueue handlers", () => {
    const { state, clearQueue } = createQueue({ initialValues: [1, 2, 3, 4], limit: 2 });

    clearQueue();

    expect(state.current).toStrictEqual([1, 2]);
    expect(state.queue).toStrictEqual([]);
  });
});
