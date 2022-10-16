import {
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
      </HStack>
    </>
  );
}
