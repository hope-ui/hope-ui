import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  AvatarRemaining,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Button,
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Progress,
  ProgressIndicator,
  ProgressLabel,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
  useColorMode,
  VStack,
} from ".";
import { IconExclamationTriangleSolid } from "./components/icons/IconExclamationTriangleSolid";
import { createIcon, Input, InputGroup, InputLeftElement, InputRightElement } from "./components";
import { IconCheck } from "./components/icons/IconCheck";

const IconCaretDown = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

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
        <Select offset={-1}>
          <SelectTrigger maxW="300px" rounded="$none" _focus={{ shadow: "$none", borderColor: "$warning7" }}>
            <SelectPlaceholder color="$warning9" fontSize="$sm" fontWeight="$black">
              Choose wisely
            </SelectPlaceholder>
            <SelectValue>
              {({ selectedOptions }) => (
                <span>
                  {selectedOptions
                    .map(val => val.textValue)
                    .join(", ")
                    .trim()}
                </span>
              )}
            </SelectValue>
            <SelectIcon>
              <IconCaretDown color="$warning9" />
            </SelectIcon>
          </SelectTrigger>
          <SelectContent rounded="$none" shadow="$xl" borderColor="$warning7">
            <SelectListbox p="0">
              <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
                {option => (
                  <SelectOption
                    value={option}
                    rounded="$none"
                    fontSize="$sm"
                    _active={{ bg: "$warning3", color: "$warning11" }}
                    _selected={{ bg: "$warning9", color: "white" }}
                  >
                    <SelectOptionText _groupSelected={{ fontWeight: "$medium" }}>{option}</SelectOptionText>
                  </SelectOption>
                )}
              </For>
            </SelectListbox>
          </SelectContent>
        </Select>
        <InputGroup>
          <InputLeftElement pointerEvents="none" color="$neutral8" fontSize="1.2em">
            $
          </InputLeftElement>
          <Input placeholder="Enter amount" />
          <InputRightElement pointerEvents="none">
            <IconCheck boxSize="20px" color="$success9" />
          </InputRightElement>
        </InputGroup>
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
