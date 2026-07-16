/**
 * The hydration-fixture bridge (`vitest-hydration-bridge.ts`, wired into the `browser` Vitest
 * project) serves genuine, freshly-rendered server HTML as the default export of
 * `virtual:hydration-fixture?id=<subject>`. `hydrateFixture`'s own suite imports the
 * `hydrate-fixture` subject to pin its success and reuse-failure paths — see `docs/testing.md`.
 *
 * The type lives here (an ambient `.d.ts`, not an inline `declare module`) because a `declare
 * module` inside a test file — which is itself a module — is read as *augmentation* of a module
 * that doesn't exist. It rides in a `types/` dir added to this package's tsconfig `include`,
 * mirroring components/theming.
 */
declare module "virtual:hydration-fixture?id=*" {
  const serverHtml: string;
  export default serverHtml;
}
