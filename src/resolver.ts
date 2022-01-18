export function HopeUIResolve() {
  return {
    libraryName: "hope-ui",
    ensureStyleFile: true,
    esModule: true,
    libraryNameChangeCase: "paramCase",
    resolveStyle: (name: string) => `hope-ui/dist/styles/${name}.scss`,
    base: "hope-ui/styles/base.scss",
  };
}
