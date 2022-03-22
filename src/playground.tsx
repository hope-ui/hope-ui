import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  Text,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <RadioGroup>
          <HStack spacing="$4">
            <Radio value="react">
              <RadioIndicator />
              <RadioLabel>React</RadioLabel>
            </Radio>
            <Radio value="angular">
              <RadioIndicator />
              <RadioLabel>Angular</RadioLabel>
            </Radio>
            <Radio value="vue">
              <RadioIndicator />
              <RadioLabel>Vue</RadioLabel>
            </Radio>
          </HStack>
        </RadioGroup>
        <RadioGroup>
          <VStack spacing="$4" w="$96" alignItems="stretch">
            <Radio
              value="hobby"
              border="1px solid $colors$neutral7"
              borderRadius="$md"
              px="$5"
              py="$3"
              _focus={{
                shadow: "$outline",
              }}
              _checked={{
                borderColor: "$info9",
              }}
            >
              <HStack justifyContent="space-between" w="$full">
                <VStack alignItems="flex-start">
                  <Text as="span" size="sm" fontWeight="$medium">
                    Hobby
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    8GB / 4 CPUs - 160GB SSD disk
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text as="span" size="sm" fontWeight="$medium">
                    $40
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    /mo
                  </Text>
                </VStack>
              </HStack>
            </Radio>
            <Radio
              value="startup"
              border="1px solid $colors$neutral7"
              borderRadius="$md"
              px="$5"
              py="$3"
              _focus={{
                shadow: "$outline",
              }}
              _checked={{
                borderColor: "$info9",
              }}
            >
              <HStack justifyContent="space-between" w="$full">
                <VStack alignItems="flex-start">
                  <Text as="span" size="sm" fontWeight="$medium">
                    Startup
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    12GB / 6 CPUs - 256GB SSD disk
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text as="span" size="sm" fontWeight="$medium">
                    $80
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    /mo
                  </Text>
                </VStack>
              </HStack>
            </Radio>
            <Radio
              value="business"
              border="1px solid $colors$neutral7"
              borderRadius="$md"
              px="$5"
              py="$3"
              _focus={{
                shadow: "$outline",
              }}
              _checked={{
                borderColor: "$info9",
              }}
            >
              <HStack justifyContent="space-between" w="$full">
                <VStack alignItems="flex-start">
                  <Text as="span" size="sm" fontWeight="$medium">
                    Business
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    16GB / 8 CPUs - 512GB SSD disk
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text as="span" size="sm" fontWeight="$medium">
                    $160
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    /mo
                  </Text>
                </VStack>
              </HStack>
            </Radio>
            <Radio
              value="enterprise"
              border="1px solid $colors$neutral7"
              borderRadius="$md"
              px="$5"
              py="$3"
              _focus={{
                shadow: "$outline",
              }}
              _checked={{
                borderColor: "$info9",
              }}
            >
              <HStack justifyContent="space-between" w="$full">
                <VStack alignItems="flex-start">
                  <Text as="span" size="sm" fontWeight="$medium">
                    Enterprise
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    32GB / 12 CPUs - 1TB SSD disk
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text as="span" size="sm" fontWeight="$medium">
                    $240
                  </Text>
                  <Text as="span" size="sm" color="$neutral11">
                    /mo
                  </Text>
                </VStack>
              </HStack>
            </Radio>
          </VStack>
        </RadioGroup>
      </VStack>
    </Box>
  );
}

const config: HopeThemeConfig = {};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
