import {
  Box,
  ColorSystem,
  Grid,
  GridItem,
  hope,
  HStack,
  useColorMode,
  useTheme,
  VStack,
} from "@hope-ui/core";
import { For, Show } from "solid-js";

interface ColorScaleProps {
  name: keyof ColorSystem;
}

export function ColorScale(props: ColorScaleProps) {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  return (
    <Grid
      templateColumns={{
        base: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      }}
      gap={8}
      mt={6}
    >
      <For each={Object.entries(theme.colors[colorMode()][props.name])}>
        {([key, value]) => (
          <Show when={!key.toLowerCase().endsWith("channel")}>
            <GridItem>
              <HStack spacing={3}>
                <Box
                  boxSize={{ base: 10, sm: 12 }}
                  flexShrink={0}
                  rounded="md"
                  shadow="inner"
                  bg={value}
                />
                <VStack alignItems="flex-start">
                  <hope.span fontSize="sm" fontWeight="semibold">
                    {key}
                  </hope.span>
                  <hope.span fontSize="sm" textTransform="lowercase">
                    {value}
                  </hope.span>
                </VStack>
              </HStack>
            </GridItem>
          </Show>
        )}
      </For>
    </Grid>
  );
}
