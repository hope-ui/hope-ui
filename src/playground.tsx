import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  HopeProvider,
  HStack,
  Icon,
  IconInfoCircle,
  IconMoon,
  Tag,
  TagCloseButton,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
} from ".";

export function App() {
  return (
    <div>
      <HStack spacing="$4" p="$4">
        <Tag size="sm" variant="solid" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="md" variant="solid" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="lg" variant="solid" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
        </Tag>
      </HStack>
      <HStack spacing="$4" p="$4">
        <Tag size="sm" variant="dot" colorScheme="primary">
          <IconInfoCircle />
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="md" variant="dot" colorScheme="primary">
          <IconInfoCircle />
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="lg" variant="dot" dotPosition="right" colorScheme="primary">
          <IconMoon />
          <TagLabel>Primary</TagLabel>
        </Tag>
      </HStack>
      <HStack spacing="$4" p="$4">
        <Tag size="sm" variant="dot" dotPosition="right" colorScheme="primary">
          <TagLeftIcon as={IconInfoCircle} />
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="md" variant="dot" dotPosition="right" colorScheme="primary">
          <TagLeftIcon as={IconInfoCircle} />
          <TagLabel>Primary</TagLabel>
        </Tag>
        <Tag size="lg" variant="dot" dotPosition="right" colorScheme="primary">
          <TagLeftIcon as={IconInfoCircle} boxSize="24px" />
          <TagLabel>Primary</TagLabel>
        </Tag>
      </HStack>
      <HStack spacing="$4" p="$4">
        <Tag size="sm" variant="dot" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
          <TagRightIcon as={IconInfoCircle} />
        </Tag>
        <Tag size="md" variant="dot" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
          <TagRightIcon as={IconInfoCircle} />
        </Tag>
        <Tag size="lg" variant="dot" colorScheme="primary">
          <TagLabel>Primary</TagLabel>
          <TagRightIcon as={IconInfoCircle} boxSize="24px" />
        </Tag>
      </HStack>
      <HStack spacing="$4" p="$4">
        <Tag size="sm" variant="solid" colorScheme="success">
          <TagLabel>Green</TagLabel>
          <TagCloseButton />
        </Tag>
        <Tag size="md" variant="solid" colorScheme="success">
          <TagLabel>Green</TagLabel>
          <TagCloseButton />
        </Tag>
        <Tag size="lg" variant="solid" colorScheme="success">
          <TagLabel>Green</TagLabel>
          <TagCloseButton />
        </Tag>
      </HStack>
    </div>
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
