// The preset machinery — the pure, DOM-free core of the preset theming API: the `Preset` type +
// `definePreset`/`isPreset`, the typed token/component-override vocabulary, and the deterministic
// `renderPresetStyle` CSS renderer. (The concrete presets themselves ship from `@hope-ui/presets/*`;
// this is the contract they and the provider are built over.)
export * from "./presets";
export { renderPresetStyle } from "./token-css";
