// Barrel for the built-in message catalogs — one `MESSAGES_<CODE>` per locale file. Consumers pull
// the whole set from here (`export * from "./locales"`) instead of listing every file, and the
// registry (`../catalogs.ts`) imports its values from one statement. Add a locale by creating
// `<code>.ts` and adding its line below (keep alphabetical).
export { MESSAGES_AR } from "./ar";
export { MESSAGES_DA } from "./da";
export { MESSAGES_DE } from "./de";
export { MESSAGES_EL } from "./el";
export { MESSAGES_EN } from "./en";
export { MESSAGES_ES } from "./es";
export { MESSAGES_FI } from "./fi";
export { MESSAGES_FR } from "./fr";
export { MESSAGES_IT } from "./it";
export { MESSAGES_PL } from "./pl";
export { MESSAGES_PT } from "./pt";
export { MESSAGES_SV } from "./sv";
