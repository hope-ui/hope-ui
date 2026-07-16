// The preset machinery — the pure, DOM-free core of the preset theming API: the `Preset` type +
// `definePreset`/`isPreset`, and the typed component-override vocabulary. Token *values* are not part
// of this API — a preset authors them in CSS (`--hope-*` custom properties; see `@hope-ui/presets/*`).
// (The concrete presets themselves ship from `@hope-ui/presets/*`; this is the contract they and the
// provider are built over.)
export * from "./preset";
