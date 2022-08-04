import { splitProps } from "solid-js";
import { render } from "solid-js/web";

import { createHopeComponent, createStyles, hope, HopeProvider, StylesProps } from "../src";

type ButtonParts = "root";

const CustomButton = createHopeComponent<"button", ButtonProps>(props => {
  const { styles } = customButtonStyles();

  return <Button styles={styles()} {...props} />;
});

const customButtonStyles = createStyles<ButtonParts>("CustomButton", {
  root: {
    bg: "red.500",
  },
});

const buttonStyles = createStyles<ButtonParts>("Button", {
  root: {
    bg: "blue.500",
    color: "white",
  },
});

interface ButtonProps extends StylesProps<ButtonParts> {
  isFullWidth?: boolean;
}

const Button = createHopeComponent<"button", ButtonProps>(props => {
  const [local, others] = splitProps(props, ["styles", "unstyled", "__css"]);

  const { styles } = buttonStyles(undefined, {
    styles: () => local.styles,
    unstyled: () => local.unstyled,
  });

  return <hope.button __css={{ ...styles().root, ...local.__css }} {...others} />;
});

function App() {
  return (
    <HopeProvider>
      <CustomButton __css={{ rounded: "md" }} mr={4}>
        Override with classNames and createStyles - red
      </CustomButton>
      <Button
        styles={{
          root: {
            bg: "green.500",
          },
        }}
      >
        Override with inline styles - green
      </Button>
      <Button>Base createStyles - blue</Button>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
