export function HopeUIResolve() {
  return {
    libraryName: "hope-ui-solid",
    ensureStyleFile: true,
    esModule: true,
    libraryNameChangeCase: "paramCase",
    resolveStyle: (name: string) => `hope-ui-solid/dist/styles/${name}.scss`,
    base: "hope-ui-solid/styles/base.scss",
  };
}
