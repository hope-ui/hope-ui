import { createStore } from "solid-js/store";

interface CreateQueueProps<T> {
  initialValues?: T[];
  limit: number;
}

export function createQueue<T>(props: CreateQueueProps<T>) {
  const [state, setState] = createStore({
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
    state,
    add,
    update,
    clearQueue,
  };
}
