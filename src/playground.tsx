import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  HopeComponentProps,
  HopeProvider,
  HStack,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from ".";

function BannerLink(props: HopeComponentProps<"a">) {
  return (
    <Box
      {...props}
      as="a"
      href="#"
      px="$4"
      py="$1_5"
      textAlign="center"
      textDecoration="none"
      borderWidth="1px"
      borderColor="whiteAlpha4"
      fontWeight="$medium"
      borderRadius="$md"
      _hover={{ bg: "$whiteAlpha5" }}
    />
  );
}

export function App() {
  const { toggleColorMode } = useColorMode();
  return (
    <Box as="section" pt="$8" pb="$12">
      <Stack
        direction={{ "@initial": "column", "@sm": "row" }}
        justifyContent="center"
        alignItems="center"
        py="$3"
        px={{ "@initial": "$3", "@md": "$6", "@lg": "$8" }}
        color="white"
        bg={useColorModeValue("$primary3", "$info3")()}
      >
        <HStack spacing="$3">
          <Text fontWeight="$medium" mr="$2">
            Confirm your email. Check your email. We&apos;ve send a message to{" "}
            <b>sample@gmail.com</b>
          </Text>
        </HStack>
        <BannerLink
          onClick={toggleColorMode}
          w={{ "@initial": "full", "@sm": "auto" }}
          flexShrink={0}
        >
          Resend email
        </BannerLink>
      </Stack>
    </Box>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
