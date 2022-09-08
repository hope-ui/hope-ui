import { IconButton, useColorMode, useColorModeValue } from "@hope-ui/core";
import { ComponentProps } from "solid-js";

import { MoonIcon, SunIcon } from "./icons";

export function ColorModeSwitcher(props: Omit<ComponentProps<typeof IconButton>, "aria-label">) {
  const { toggleColorMode } = useColorMode();
  const icon = useColorModeValue(<MoonIcon boxSize={5} />, <SunIcon boxSize={5} />);

  return (
    <IconButton
      variant="plain"
      colorScheme="neutral"
      size="sm"
      aria-label="toggle color mode"
      onClick={toggleColorMode}
      {...props}
    >
      {icon()}
    </IconButton>
  );
}
