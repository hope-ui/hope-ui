import { ColorModeProvider, ColorModeProviderProps } from "../color-mode";

export type HopeAppProps = ColorModeProviderProps;

/**
 * Root of a Hope UI application.
 */
export function HopeApp(props: HopeAppProps) {
  return (
    <ColorModeProvider initialColorMode={props.initialColorMode}>
      <div class="hope-app">{props.children}</div>
    </ColorModeProvider>
  );
}
