import {
  Button,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftSection,
  InputRightAddon,
  InputRightSection,
  VStack,
} from "../src";

export default function App() {
  return (
    <>
      <HStack>
        <VStack spacing="4" maxW={96} p={4}>
          <Divider>Sizes</Divider>
          <Input placeholder="Small" size="sm" />
          <Input placeholder="Medium" size="md" />
          <Input placeholder="Large" size="lg" />

          <Divider>Variants</Divider>
          <Input placeholder="Filled" variant="filled" />
          <Input placeholder="Outlined" variant="outlined" />
          <Input placeholder="Plain" variant="plain" />

          <Divider>Invalid</Divider>
          <Input placeholder="Filled" variant="filled" isInvalid />
          <Input placeholder="Outlined" variant="outlined" isInvalid />
          <Input placeholder="Plain" variant="plain" isInvalid />

          <Divider>Disabled</Divider>
          <Input placeholder="Filled" variant="filled" isDisabled />
          <Input placeholder="Outlined" variant="outlined" isDisabled />
          <Input placeholder="Plain" variant="plain" isDisabled />
        </VStack>

        <VStack spacing="4" maxW={96} p={4}>
          <Divider>Sizes</Divider>
          <InputGroup size="sm">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Small" />
          </InputGroup>
          <InputGroup size="md">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Medium" />
          </InputGroup>
          <InputGroup size="lg">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Large" />
          </InputGroup>

          <Divider>Variants</Divider>
          <InputGroup variant="filled">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
          </InputGroup>
          <InputGroup variant="outlined">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
          </InputGroup>
          <InputGroup variant="plain">
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
          </InputGroup>

          <Divider>Invalid</Divider>
          <InputGroup variant="filled" isInvalid>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
          </InputGroup>
          <InputGroup variant="outlined" isInvalid>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
          </InputGroup>
          <InputGroup variant="plain" isInvalid>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
          </InputGroup>

          <Divider>Disabled</Divider>
          <InputGroup variant="filled" isDisabled>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
          </InputGroup>
          <InputGroup variant="outlined" isDisabled>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
          </InputGroup>
          <InputGroup variant="plain" isDisabled isRequired isReadOnly isInvalid>
            <InputLeftAddon>+234</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
          </InputGroup>
        </VStack>

        <VStack spacing="4" maxW={96} p={4}>
          <Divider>Sizes</Divider>
          <InputGroup size="sm">
            <Input type="url" placeholder="Small" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup size="md">
            <Input type="tel" placeholder="Medium" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup size="lg">
            <Input type="tel" placeholder="Large" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Variants</Divider>
          <InputGroup variant="filled">
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined">
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain">
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Invalid</Divider>
          <InputGroup variant="filled" isInvalid>
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined" isInvalid>
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain" isInvalid>
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Disabled</Divider>
          <InputGroup variant="filled" isDisabled>
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined" isDisabled>
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain" isDisabled isRequired isReadOnly isInvalid>
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
        </VStack>

        <VStack spacing="4" maxW={96} p={4}>
          <Divider>Sizes</Divider>
          <InputGroup size="sm">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="url" placeholder="Small" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup size="md">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Medium" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup size="lg">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Large" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Variants</Divider>
          <InputGroup variant="filled">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain">
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Invalid</Divider>
          <InputGroup variant="filled" isInvalid>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined" isInvalid>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain" isInvalid>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>

          <Divider>Disabled</Divider>
          <InputGroup variant="filled" isDisabled>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Filled" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="outlined" isDisabled>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Outlined" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
          <InputGroup variant="plain" isDisabled isRequired isReadOnly isInvalid>
            <InputLeftAddon>http://</InputLeftAddon>
            <Input type="tel" placeholder="Plain" />
            <InputRightAddon>.com</InputRightAddon>
          </InputGroup>
        </VStack>
      </HStack>

      <InputGroup maxW={96} m={4}>
        <InputLeftSection pointerEvents="none" color="neutral.500" fontSize="1.2em">
          $
        </InputLeftSection>
        <Input placeholder="Enter amount" />
        <InputRightSection pointerEvents="none" color="neutral.500" fontSize="1.2em">
          $
        </InputRightSection>
      </InputGroup>
    </>
  );
}
