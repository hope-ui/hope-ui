import { createStore } from "solid-js/store";

interface CreateQueueProps<T> {
  initialValues?: T[];
  limit: number;
}

interface CreateQueueState<T> {
  current: T[];
  queue: T[];
  limit: number;
}

interface CreateQueueReturn<T> {
  state: CreateQueueState<T>;
  add: (...items: T[]) => void;
  update: (fn: (state: T[]) => T[]) => void;
  clearQueue: () => void;
}

export function createQueue<T>(props: CreateQueueProps<T>): CreateQueueReturn<T> {
  const [state, setState] = createStore<CreateQueueState<T>>({
    // eslint-disable-next-line solid/reactivity
    current: props.initialValues?.slice(0, props.limit) ?? [],

    // eslint-disable-next-line solid/reactivity
    queue: props.initialValues?.slice(props.limit) ?? [],

    get limit() {
      return props.limit;
    },
  });

  const add = (...items: T[]) => {
    const results = [...state.current, ...state.queue, ...items];

    setState("current", results.slice(0, state.limit));
    setState("queue", results.slice(state.limit));
  };

  const update = (fn: (state: T[]) => T[]) => {
    const results = fn([...state.current, ...state.queue] as Array<T>);

    setState("current", results.slice(0, state.limit));
    setState("queue", results.slice(state.limit));
  };

  const clearQueue = () => {
    setState("queue", []);
  };

  return {
    state: state as CreateQueueState<T>,
    add,
    update,
    clearQueue,
  };
}
