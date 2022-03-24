/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */

import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
  Checkbox,
  CheckboxControl,
  CheckboxLabel,
  useColorMode,
  VStack,
  Switch,
  Text,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const plans = [
    {
      id: 1,
      name: "Startup",
      ram: "12GB",
      cpus: "6 CPUs",
      disk: "160 GB SSD disk",
    },
    {
      id: 2,
      name: "Business",
      ram: "16GB",
      cpus: "8 CPUs",
      disk: "512 GB SSD disk",
    },
    {
      id: 3,
      name: "Enterprise",
      ram: "32GB",
      cpus: "12 CPUs",
      disk: "1024 GB SSD disk",
    },
  ];

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <Switch>{({ checked }) => <span>{checked.toString()}</span>}</Switch>
        <Checkbox>{({ checked }) => <span>{checked.toString()}</span>}</Checkbox>
        <RadioGroup>
          <VStack spacing="$4">
            <For each={plans}>
              {plan => (
                <Radio
                  value={plan.id}
                  rounded="$md"
                  border="1px solid $neutral7"
                  shadow="$sm"
                  bg="$loContrast"
                  px="$4"
                  py="$3"
                  w="$full"
                  _focus={{
                    borderColor: "$info7",
                    shadow: "0 0 0 3px $colors$info5",
                  }}
                  _checked={{
                    borderColor: "transparent",
                    bg: "#0c4a6e",
                    color: "white",
                  }}
                >
                  {({ checked }) => (
                    <RadioLabel>
                      <VStack alignItems="flex-start">
                        <Text size="sm" fontWeight="$semibold">
                          {plan.name}
                        </Text>
                        <Text
                          size="sm"
                          color="$neutral11"
                          _groupChecked={{
                            color: "$whiteAlpha12",
                          }}
                        >
                          {plan.ram}/{plan.cpus} - {plan.disk}
                        </Text>
                      </VStack>
                      <span>{checked.toString()}</span>
                    </RadioLabel>
                  )}
                </Radio>
              )}
            </For>
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
