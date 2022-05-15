import { Accessor, createSignal } from "solid-js";

interface CreateQueueProps<T> {
  initialValues?: T[];
  limit: number;
}

interface CreateQueueState<T> {
  current: Accessor<T[]>;
  queue: Accessor<T[]>;
  limit: Accessor<number>;
}

interface CreateQueueReturn<T> {
  state: CreateQueueState<T>;
  add: (...items: T[]) => void;
  update: (fn: (state: T[]) => T[]) => void;
  clearQueue: () => void;
}

export function createQueue<T>(props: CreateQueueProps<T>): CreateQueueReturn<T> {
  const [currentState, setCurrentState] = createSignal(
    props.initialValues?.slice(0, props.limit) ?? []
  );

  const [queue, setQueue] = createSignal(props.initialValues?.slice(props.limit) ?? []);

  const limit = () => props.limit;

  const add = (...items: T[]) => {
    const results = [...currentState(), ...queue(), ...items];

    setCurrentState(results.slice(0, limit()) as T[]);
    setQueue(results.slice(limit()) as T[]);
  };

  const update = (fn: (state: T[]) => T[]) => {
    const results = fn([...currentState(), ...queue()] as Array<T>);

    setCurrentState(results.slice(0, limit()) as T[]);
    setQueue(results.slice(limit()) as T[]);
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const state: CreateQueueState<T> = {
    current: currentState,
    queue,
    limit,
  };

  return {
    state,
    add,
    update,
    clearQueue,
  };
}
