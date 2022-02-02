import { noop } from "./function";

/**
 * SSR: Graceful fallback for the `body` element
 */
export const mockBody = {
  classList: { add: noop, remove: noop },
};
