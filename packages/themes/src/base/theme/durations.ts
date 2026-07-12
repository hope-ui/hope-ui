import { defineTokens } from "@pandacss/dev";

/** A convenience duration scale (v4 ships only a 150ms default transition duration). */
export const durations = defineTokens.durations({
  fast: { value: "150ms" },
  normal: { value: "200ms" },
  slow: { value: "300ms" },
  slower: { value: "500ms" },
});
