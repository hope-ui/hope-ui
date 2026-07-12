/**
 * The semantic color **contract** — the exact shape every `@hope-ui/themes/*` theme's
 * `semanticTokens.colors` must implement.
 *
 * A theme is values behind shared names: components and recipes reference the token *names*
 * (`color="text.destructive"` → `var(--colors-text-destructive)`), so a missing or misspelled token
 * compiles to an *unresolved* CSS variable and silently breaks styling rather than erroring. Typing
 * a theme's `colors` with `satisfies SemanticColorContract` turns that into a `tsc` error: missing
 * keys fail assignability, and extra/typo keys fail the object-literal excess-property check. It is
 * the compile-time analog of the recipe axis's `SlotRecipeFn` + conformance kit.
 *
 * The vocabulary itself is documented in `docs/theming.md` ("Semantic token vocabulary"); this type
 * is its machine-checked copy. Out-of-contract decorative tokens (`chart.*`, `palette.*` — decision
 * 07) are merged OUTSIDE the `satisfies` object, never added here.
 *
 * `Val` restricts a token value to a bare string or a `{ base, _dark }` light/dark pair — the only
 * forms hope themes use. Widen it if a theme needs additional Panda conditions.
 */
type Val = { value: string | { base: string; _dark: string } };

/** A Panda token group: a bare `DEFAULT` value plus named child tokens. */
type Grp<Children> = { DEFAULT: Val } & Children;

/**
 * A role's text (or icon) colors. `DEFAULT` is the role color used as a standalone foreground on a
 * neutral surface (a link, an inline error). `foreground` is the on-color for that role's *solid*
 * fill; `subtle.foreground` the on-color for its *subtle* fill. Each fill owns the on-color
 * guaranteed to read on it in both themes — so no single global "inverse" has to serve both the
 * flipping neutrals and the fixed chromatic fills.
 */
type RoleFg = Grp<{ foreground: Val; subtle: { foreground: Val } }>;

/** A role fill: the bare solid background (`DEFAULT`) + its `subtle`/tonal variant. */
type Fill = Grp<{ subtle: Val }>;

export interface SemanticColorContract {
  // surfaces (elevation)
  surface: Grp<{ raised: Val; overlay: Val; sunken: Val; inverse: Val }>;
  // foreground: text + icon, split. Neutral ramp (`DEFAULT`→`subtlest`) + `inverse` (text on the
  // inverse surface), plus a per-role group (`text.destructive`, …) carrying the role's standalone
  // text color and its on-fill foregrounds.
  text: Grp<{
    subtle: Val;
    subtlest: Val;
    disabled: Val;
    inverse: Val;
    primary: RoleFg;
    neutral: RoleFg;
    success: RoleFg;
    info: RoleFg;
    warning: RoleFg;
    destructive: RoleFg;
  }>;
  icon: Grp<{
    subtle: Val;
    disabled: Val;
    inverse: Val;
    primary: RoleFg;
    neutral: RoleFg;
    success: RoleFg;
    info: RoleFg;
    warning: RoleFg;
    destructive: RoleFg;
  }>;
  // borders: neutral ramp + role-colored borders (neutral border == the default `border`)
  border: Grp<{
    bold: Val;
    disabled: Val;
    primary: Val;
    success: Val;
    info: Val;
    warning: Val;
    destructive: Val;
  }>;
  // fills (role-first; bare = solid, `.subtle` = tonal). On-colors live under `text`/`icon`.
  primary: Fill;
  neutral: Fill;
  success: Fill;
  info: Fill;
  warning: Fill;
  destructive: Fill;
  // systemic
  ring: Val;
  scrim: Val;
}
