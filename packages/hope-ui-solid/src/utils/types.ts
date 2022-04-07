import { JSX } from "solid-js";

/**
 * Allows for extending a set of props (`SourceProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type RightJoinProps<SourceProps = {}, OverrideProps = {}> = Omit<SourceProps, keyof OverrideProps> &
  OverrideProps;

export type EventKeys =
  | "ArrowDown"
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "Space"
  | "Tab"
  | "Backspace"
  | "Control"
  | "Meta"
  | "Home"
  | "End"
  | "PageDown"
  | "PageUp"
  | "Delete"
  | "Escape"
  | " "
  | "Shift";

export type EventKeyMap = Partial<Record<EventKeys, JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>>>;
