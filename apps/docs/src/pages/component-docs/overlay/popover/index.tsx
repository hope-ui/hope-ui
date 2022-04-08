import {
  Alert,
  AlertDescription,
  AlertTitle,
  Anchor,
  Box,
  Button,
  ButtonGroup,
  createDisclosure,
  HStack,
  IconButton,
  Input,
  Kbd,
  ListItem,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconMenu } from "@/icons/IconMenu";

import { snippets } from "./snippets";

export default function PopoverDoc() {
  const { isOpen, onClose, onToggle } = createDisclosure();

  const previousLink: ContextualNavLink = {
    href: "/docs/overlay/modal",
    label: "Modal",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/overlay/tooltip",
    label: "Tooltip",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#trigger-mode", label: "Trigger mode", indent: true },
    { href: "#initial-focus", label: "Initial focus", indent: true },
    { href: "#focus-trap", label: "Trapping focus within popover", indent: true },
    { href: "#popover-placement", label: "Popover placement", indent: true },
    { href: "#popover-anchor", label: "Popover anchor", indent: true },
    { href: "#accessing-internal-state", label: "Accessing internal state", indent: true },
    { href: "#controlled-popover", label: "Controlled popover", indent: true },
    { href: "#composition", label: "Composition" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#popover-props", label: "Popover props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "placement",
      description: "Placement of the popover.",
      type: "Placement",
      defaultValue: "bottom",
    },
    {
      name: "offset",
      description: "Offset between the popover and the reference (trigger) element.",
      type: "number",
      defaultValue: "8",
    },
    {
      name: "shiftPadding",
      description:
        "The amount of padding to apply when the popover might go off screen. @see https://floating-ui.com/docs/shift.",
      type: "number",
    },
    {
      name: "id",
      description: "The id of the popover content.",
      type: "string",
    },
    {
      name: "opened",
      description: "If `true`, the popover will be shown (in controlled mode).",
      type: "boolean",
    },
    {
      name: "defaultOpened",
      description: "If `true`, the popover will be initially shown (in uncontrolled mode).",
      type: "boolean",
    },
    {
      name: "triggerMode",
      description:
        "The interaction that triggers the popover. `hover` means the popover will open when you hover with mouse or focus with keyboard on the popover trigger. `click` means the popover will open on click or press `Enter` to `Space` on keyboard.",
      type: '"hover" | "click"',
      defaultValue: '"click"',
    },
    {
      name: "inline",
      description:
        "If `true`, apply floating-ui `inline` middleware. Useful for inline reference elements that span over multiple lines, such as hyperlinks or range selections.",
      type: "boolean",
    },
    {
      name: "arrowPadding",
      description: "The padding between the arrow and the edges of the popover.",
      type: "number",
      defaultValue: "8",
    },
    {
      name: "openDelay",
      description: "Delay (in ms) before showing the popover.",
      type: "number",
      defaultValue: "0",
    },
    {
      name: "closeDelay",
      description: "Delay (in ms) before hiding the popover.",
      type: "number",
      defaultValue: "100",
    },
    {
      name: "closeOnBlur",
      description: "If `true`, the popover will close when the user blur out it by clicking outside or tabbing out.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "closeOnEsc",
      description: "If `true`, the popover will close when the user hit the `Esc` key.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "trapFocus",
      description: "If `true`, the focus will be locked into the popover.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "initialFocus",
      description: "A query selector string targeting the element to receive focus when the popover opens.",
      type: "string",
    },
    {
      name: "motionPreset",
      description: "Popover opening/closing transition.",
      type: "PopoverMotionPreset",
      defaultValue: '"scale"',
    },
    {
      name: "children",
      description: "Children of the popover.",
      type: "JSX.Element | PopoverChildrenRenderProp",
    },
    {
      name: "onOpen",
      description: "Callback fired when the popover opens.",
      type: "() => void",
    },
    {
      name: "onClose",
      description: "Callback fired when the popover closes.",
      type: "() => void",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Popover</PageTitle>
      <Text mb="$5">
        Popover is a non-modal dialog that floats around a trigger. It is used to display contextual information to the
        user, and should be paired with a clickable trigger element.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Popover:</strong> The wrapper that provides props, state, and context to its children.
        </ListItem>
        <ListItem>
          <strong>PopoverTrigger:</strong> The component that opens/closes the popover.
        </ListItem>
        <ListItem>
          <strong>PopoverAnchor:</strong> The component to use as positioning reference instead of the trigger.
        </ListItem>
        <ListItem>
          <strong>PopoverContent:</strong> The popover itself.
        </ListItem>
        <ListItem>
          <strong>PopoverArrow:</strong> A visual arrow that points to the reference (trigger or anchor) element.
        </ListItem>
        <ListItem>
          <strong>PopoverCloseButton:</strong> A button to close the popover.
        </ListItem>
        <ListItem>
          <strong>PopoverHeader:</strong> The header of the popover.
        </ListItem>
        <ListItem>
          <strong>PopoverBody:</strong> The body of the popover.
        </ListItem>
        <ListItem>
          <strong>PopoverFooter:</strong> The footer of the popover.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        <Code>PopoverTrigger</Code> renders an unstyled <Code>button</Code> by default. For accessiblity reason, when
        using the <Code>as</Code> prop ensure the element passed in is focusable.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$6">
        <Popover>
          <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
            Trigger
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertTitle>Accessibility:</AlertTitle>
        <AlertDescription ml="$2">
          When the popover opens, focus is sent to <Code>PopoverContent</Code>.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="trigger-mode">Trigger mode</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>triggerMode</Code> prop to change the way of opening the popover. You can set the value to{" "}
        <Code>hover</Code> or <Code>click</Code>.
      </Text>
      <Preview snippet={snippets.triggerOnHover} mb="$10">
        <Popover triggerMode="hover">
          <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
            Trigger
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionSubtitle id="initial-focus">Initial focus</SectionSubtitle>
      <Text mb="$5">
        By default, focus is sent to <Code>PopoverContent</Code> when it opens. Use the <Code>initialFocus</Code> prop
        to send focus to a specific element instead.
      </Text>
      <Preview snippet={snippets.initialFocus} mb="$10">
        <Popover initialFocus="#next">
          <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
            Trigger
          </PopoverTrigger>
          <PopoverContent maxW="$sm">
            <PopoverHeader border="0">Running the app</PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>To start the development server run npm start command</PopoverBody>
            <PopoverFooter border="0" d="flex" alignItems="center" justifyContent="space-between" pb="$4">
              <Box fontSize="$sm">Step 2 of 4</Box>
              <ButtonGroup size="sm">
                <Button colorScheme="neutral" variant="subtle">
                  Previous
                </Button>
                <Button id="next" colorScheme="info">
                  Next
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionSubtitle id="focus-trap">Trapping focus within popover</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>trapFocus</Code> prop to lock focus inside the <Code>PopoverContent</Code>.
      </Text>
      <Preview snippet={snippets.focusTrap} mb="$10">
        <Popover trapFocus>
          <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
            Trigger
          </PopoverTrigger>
          <PopoverContent maxW="$sm">
            <PopoverHeader border="0">Running the app</PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>To start the development server run npm start command</PopoverBody>
            <PopoverFooter border="0" d="flex" alignItems="center" justifyContent="space-between" pb="$4">
              <Box fontSize="$sm">Step 2 of 4</Box>
              <ButtonGroup size="sm">
                <Button colorScheme="neutral" variant="subtle">
                  Previous
                </Button>
                <Button colorScheme="info">Next</Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionSubtitle id="popover-placement">Popover placement</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>placement</Code> prop to set the preferred popover placement. You can set the value to{" "}
        <Code>top</Code>, <Code>right</Code>, <Code>left</Code>, <Code>bottom</Code> and their <Code>-start</Code> or{" "}
        <Code>-end</Code> variants.
      </Text>
      <Preview snippet={snippets.placement} mb="$6">
        <Popover placement="top-start">
          <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
            Trigger
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          Even though you specified the placement, Popover will try to reposition itself in the event that available
          space at the specified placement isn't enough.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="popover-anchor">Popover anchor</SectionSubtitle>
      <Text mb="$3">
        Use the <Code>PopoverAnchor</Code> component if you want to use a different element for the popover positioning
        reference.
      </Text>
      <Text mb="$5">
        In the example below, the <Code>Button</Code> is the trigger that opens/closes the popover and the{" "}
        <Code>Input</Code> is the reference element that the popover will position relative to.
      </Text>
      <Preview snippet={snippets.anchor} mb="$10">
        <Popover>
          <HStack spacing="$2">
            <PopoverAnchor as={Input} w="auto" display="inline-flex" placeholder="I am the anchor" />
            <PopoverTrigger as={Button}>Trigger</PopoverTrigger>
          </HStack>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionSubtitle id="accessing-internal-state">Accessing internal state</SectionSubtitle>
      <Text mb="$5">
        Popover provides access to its internal state <Code>opened</Code> state and an <Code>onClose</Code> method that
        you can access via a render prop.
      </Text>
      <Preview snippet={snippets.internalState} mb="$10">
        <Popover closeOnBlur={false} placement="left" initialFocus="#close-btn">
          {({ opened, onClose }) => (
            <>
              <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
                Click to {opened() ? "close" : "open"}
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>This is the header</PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>
                  <Box>Hello. Nice to meet you! This is the body of the popover</Box>
                  <Button id="close-btn" mt="$4" colorScheme="info" onClick={onClose}>
                    Close
                  </Button>
                </PopoverBody>
                <PopoverFooter>This is the footer</PopoverFooter>
              </PopoverContent>
            </>
          )}
        </Popover>
      </Preview>
      <SectionSubtitle id="controlled-popover">Controlled popover</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>opened</Code> and <Code>onClose</Code> props to control the opening and closing of the popover.
      </Text>
      <Preview snippet={snippets.controlled} mb="$12">
        <Button variant="subtle" colorScheme="neutral" mr="$2" onClick={onToggle}>
          Trigger
        </Button>
        <Popover placement="right" closeOnBlur={false} opened={isOpen()} onClose={onClose}>
          <PopoverTrigger as={Button}>Popover Target</PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionTitle id="composition">Composition</SectionTitle>
      <Text mb="$5">
        <Code>Popover</Code> is made up of several components that you can customize to achieve your desired design.
      </Text>
      <Preview snippet={snippets.composition} mb="$12">
        <Popover offset={24}>
          <PopoverTrigger
            as={IconButton}
            icon={<IconMenu />}
            aria-label="trigger"
            variant="outline"
            colorScheme="accent"
          />
          <PopoverContent borderColor="$accent3" bg="$accent3" color="$accent11" maxW="$sm">
            <PopoverHeader fontWeight="$semibold" border="none" pb="0">
              Confirmation!
            </PopoverHeader>
            <PopoverArrow borderColor="$accent3" boxSize="24px" />
            <PopoverCloseButton bg="$accent4" />
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Code>PopoverTrigger</Code> has <Code>aria-haspopup</Code> set to <Code>dialog</Code> to denote that it
          triggers a popover.
        </ListItem>
        <ListItem>
          <Code>PopoverTrigger</Code> has <Code>aria-controls</Code> set to the <Code>id</Code> of the{" "}
          <Code>PopoverContent</Code>.
        </ListItem>
        <ListItem>
          <Code>PopoverTrigger</Code> has <Code>aria-expanded</Code> set to <Code>true</Code> or <Code>false</Code>{" "}
          depending on the open/closed state of the popover.
        </ListItem>
        <ListItem>
          <Code>PopoverContent</Code> has <Code>aria-labelledby</Code> set to the <Code>id</Code> of the{" "}
          <Code>PopoverHeader</Code>.
        </ListItem>
        <ListItem>
          <Code>PopoverContent</Code> has <Code>aria-describedby</Code> set to the <Code>id</Code> of the{" "}
          <Code>PopoverBody</Code>.
        </ListItem>
        <ListItem>
          When the <Code>triggerMode</Code> is set to <Code>hover</Code>, <Code>PopoverContent</Code> has{" "}
          <Code>role</Code> set to <Code>tooltip</Code>, otherwise <Code>role</Code> is set to <Code>dialog</Code>.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (closed popover)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          When the <Code>triggerMode</Code> prop is set to <Code>click</Code>, clicking the <Code>PopoverTrigger</Code>{" "}
          or pressing <Kbd>space</Kbd> or <Kbd>enter</Kbd> when focus is on the trigger will open the popover.
        </ListItem>
        <ListItem>
          When the <Code>triggerMode</Code> prop is set to <Code>hover</Code>, focusing on or mousing over the{" "}
          <Code>PopoverTrigger</Code> will open the popover.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (opened popover)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          When the <Code>initialFocus</Code> prop is set, focus is moved to the matching element, otherwise focus moves
          to the <Code>PopoverContent</Code>.
        </ListItem>
        <ListItem>
          When the <Code>triggerMode</Code> prop is set to <Code>click</Code>, clicking the <Code>PopoverTrigger</Code>{" "}
          closes the popover.
        </ListItem>
        <ListItem>
          When the <Code>triggerMode</Code> prop is set to <Code>hover</Code>, blurring or mousing out of the{" "}
          <Code>PopoverTrigger</Code> will close the popover. If you move your mouse into the{" "}
          <Code>PopoverContent</Code>, it'll remain visible.
        </ListItem>
        <ListItem>
          When focus is within the <Code>PopoverContent</Code> and <Code>closeOnEsc</Code> prop is set to{" "}
          <Code>true</Code>, pressing <Kbd>esc</Kbd> closes the popover.
        </ListItem>
        <ListItem>
          When <Code>closeOnBur</Code> prop is set to <Code>true</Code>, clicking outside or blurring out of the{" "}
          <Code>PopoverContent</Code> closes the popover.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Popover</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="popover-props">Popover props</SectionSubtitle>
      <PropsTable items={propItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <UnorderedList spacing="$2">
        <ListItem>
          <Code>PopoverContent</Code>, <Code>PopoverArrow</Code>, <Code>PopoverHeader</Code>, <Code>PopoverBody</Code>{" "}
          and <Code>PopoverFooter</Code> composes{" "}
          <Anchor as={Link} href="/docs/layout/box" external color="$primary11" fontWeight="$semibold">
            Box
          </Anchor>
          .
        </ListItem>
        <ListItem>
          <Code>PopoverCloseButton</Code> composes{" "}
          <Anchor as={Link} href="/docs/others/close-button" external color="$primary11" fontWeight="$semibold">
            CloseButton
          </Anchor>
          .
        </ListItem>
      </UnorderedList>
    </PageLayout>
  );
}
