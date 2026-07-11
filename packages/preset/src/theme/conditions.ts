/**
 * hope-ui conditions. Dark mode is opt-in via a `.dark` class on an ancestor (shadcn
 * convention), so `_dark`-conditioned semantic tokens resolve under `.dark`.
 */
export const conditions = {
  dark: ".dark &",
} as const;
