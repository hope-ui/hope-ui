import { HopeProvider } from "@hope-ui/core/src";

const theme = extendTheme({
  initialColorMode: "light",
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "",
          100: "",
          200: "",
          300: "",
          400: "",
          500: "",
          600: "",
          700: "",
          800: "",
          900: "",
          mainChannel: "100",
          lightChannel: "500",
          darkChannel: "900",
          //
          plainColor: "",
          plainBg: "",
          plainBorder: "",
          // hover state
          plainHoverColor: "",
          plainHoverBorder: "",
          plainHoverBg: "",
          // active state
          plainActiveColor: "",
          plainActiveBorder: "",
          plainActiveBg: "",
          // disabled state
          plainDisabledColor: "",
          plainDisabledBorder: "",
          plainDisabledBg: "",

          outlinedColor: "",
          outlinedBorder: "",
          outlinedBg: "",
          // hover state
          outlinedHoverColor: "",
          outlinedHoverBorder: "",
          outlinedHoverBg: "",
          // active state
          outlinedActiveColor: "",
          outlinedActiveBorder: "",
          outlinedActiveBg: "",
          // disabled state
          outlinedDisabledColor: "",
          outlinedDisabledBorder: "",
          outlinedDisabledBg: "",

          softColor: "",
          softBorder: "",
          softBg: "",
          // hover state
          softHoverColor: "",
          softHoverBorder: "",
          softHoverBg: "",
          // active state
          softActiveColor: "",
          softActiveBorder: "",
          softActiveBg: "",
          // disabled state
          softDisabledColor: "",
          softDisabledBorder: "",
          softDisabledBg: "",

          solidColor: "",
          solidBg: "",
          solidBorder: "",
          // hover state
          solidHoverColor: "",
          solidHoverBg: "",
          solidHoverBorder: "",
          // active state
          solidActiveColor: "",
          solidActiveBg: "",
          solidActiveBorder: "",
          // disabled state
          solidDisabledColor: "",
          solidDisabledBg: "",
          solidDisabledBorder: "",

          // override palette.text
          overrideTextPrimary: "",
          overrideTextSecondary: "",
          overrideTextTertiary: "",
        },
      },
    },
  },
});

export default function App() {
  return <HopeProvider theme={theme}></HopeProvider>;
}
