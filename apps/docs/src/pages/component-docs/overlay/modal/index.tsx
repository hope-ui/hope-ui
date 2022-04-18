import {
  Alert,
  AlertDescription,
  Anchor,
  Button,
  createDisclosure,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Kbd,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Radio,
  RadioControl,
  RadioGroup,
  RadioLabel,
  Text,
  UnorderedList,
} from "@hope-ui/design-system";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { createSignal, For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function ModalDoc() {
  const basicUsageDisclosure = createDisclosure();
  const blockScrollDisclosure = createDisclosure();
  const initialFocusDisclosure = createDisclosure();
  const closeOnOverlayClickDisclosure = createDisclosure();
  const centeredDisclosure = createDisclosure();
  const transitionDisclosure = createDisclosure();
  const overflowDisclosure = createDisclosure();
  const sizeDisclosure = createDisclosure();
  const trapFocusDisclosure = createDisclosure();
  const backdropStyleDisclosure = createDisclosure();

  const [scrollBehavior, setScrollBehavior] = createSignal("inside");

  const [size, setSize] = createSignal<ModalProps["size"]>("md");

  const handleSizeClick = (newSize: ModalProps["size"]) => {
    setSize(() => newSize);
    sizeDisclosure.onOpen();
  };

  const sizes = ["xs", "sm", "md", "lg", "xl", "full"];

  const previousLink: ContextualNavLink = {
    href: "/docs/overlay/menu",
    label: "Menu",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/overlay/popover",
    label: "Popover",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#block-scrolling", label: "Block scrolling when modal opens", indent: true },
    { href: "#focus-on-specific-element", label: "Focus on specific element", indent: true },
    { href: "#close-on-overlay-click", label: "Close modal on overlay click", indent: true },
    { href: "#modal-vertically-centered", label: "Make modal vertically centered", indent: true },
    { href: "#changing-transition", label: "Changing the transition", indent: true },
    { href: "#overflow-behavior", label: "Modal overflow behavior", indent: true },
    { href: "#modal-sizes", label: "Modal sizes", indent: true },
    { href: "#prevent-focus-trapping", label: "Prevent focus trapping", indent: true },
    { href: "#styling-backdrop", label: "Styling the backdrop", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#modal-props", label: "Modal props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const propItems: PropsTableItem[] = [
    {
      required: true,
      name: "opened",
      description: "If `true`, the modal will be open.",
      type: "boolean",
    },
    {
      required: true,
      name: "onClose",
      description: "Callback invoked to close the modal.",
      type: "() => void",
    },
    {
      name: "size",
      description: "The size of the modal.",
      type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "full"',
      defaultValue: '"md"',
    },
    {
      name: "scrollBehavior",
      description:
        "Defines how scrolling should happen when content overflows beyond the viewport.",
      type: '"inside" | "outside"',
      defaultValue: '"outside"',
    },
    {
      name: "centered",
      description: "If `true`, the modal will be centered on screen.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "closeOnOverlayClick",
      description: "If `true`, the modal will close when the overlay is clicked.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "closeOnEsc",
      description: "If `true`, the modal will close when the `Esc` key is pressed.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "trapFocus",
      description:
        "If `false`, focus lock will be disabled completely. This is useful in situations where you still need to interact with other surrounding elements. Warning: We don't recommend doing this because it hurts the accessibility of the modal, based on WAI-ARIA specifications.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "blockScrollOnMount",
      description: "If `true`, scrolling will be disabled on the `body` when the modal opens.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "motionPreset",
      description: "The transition that should be used for the modal.",
      type: '"fade-in-bottom" | "scale" | "none"',
      defaultValue: '"scale"',
    },
    {
      name: "initialFocus",
      description:
        "A query selector string targeting the element to receive focus when the modal opens.",
      type: "string",
    },
    {
      name: "id",
      description: "The `id` of the modal dialog.",
      type: "string",
    },
    {
      name: "onOverlayClick",
      description: "Callback fired when the overlay is clicked.",
      type: "() => void",
    },
    {
      name: "onEsc",
      description: "Callback fired when the escape key is pressed and focus is within modal.",
      type: "() => void",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Modal</PageTitle>
      <Text mb="$5">
        A modal dialog is a window overlaid on either the primary window or another dialog window.
        Content behind a modal dialog is inert, meaning that users cannot interact with it.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Modal:</strong> The wrapper that provides context for its children.
        </ListItem>
        <ListItem>
          <strong>ModalOverlay:</strong> The dimmed overlay behind the modal dialog.
        </ListItem>
        <ListItem>
          <strong>ModalContent:</strong> The container for the modal dialog's content.
        </ListItem>
        <ListItem>
          <strong>ModalHeader:</strong> The header that labels the modal dialog.
        </ListItem>
        <ListItem>
          <strong>ModalBody:</strong> The wrapper that houses the modal's main content.
        </ListItem>
        <ListItem>
          <strong>ModalFooter:</strong> The footer that houses the modal actions.
        </ListItem>
        <ListItem>
          <strong>ModalCloseButton:</strong> The button that closes the modal.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        When the modal opens, focus is sent into the modal and set to the first tabbable element. If
        there are no tabbled elements, focus is set on <Code>ModalContent</Code>.
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Button onClick={basicUsageDisclosure.onOpen}>Open Modal</Button>
        <Modal opened={basicUsageDisclosure.isOpen()} onClose={basicUsageDisclosure.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>

            <ModalFooter>
              <Button onClick={basicUsageDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="block-scrolling">Block scrolling when modal opens</SectionSubtitle>
      <Text mb="$5">
        For accessibility, it is recommended to block scrolling on the main document behind the
        modal. Hope UI does this by default but you can set <Code>blockScrollOnMount</Code> to{" "}
        <Code>false</Code> to allow scrolling behind the modal.
      </Text>
      <Preview snippet={snippets.blockScroll} mb="$10">
        <Button onClick={blockScrollDisclosure.onOpen}>Open Modal</Button>
        <Modal
          blockScrollOnMount={false}
          opened={blockScrollDisclosure.isOpen()}
          onClose={blockScrollDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <Text fontWeight="$bold">You can scroll the content behind the modal</Text>
            </ModalBody>

            <ModalFooter>
              <Button onClick={blockScrollDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="focus-on-specific-element">Focus on specific element</SectionSubtitle>
      <Text mb="$5">
        Hope UI automatically sets focus on the first tabbable element in the modal. However, there
        might be scenarios where you need to manually control where focus goes. To do this, pass a
        CSS query selector to the <Code>initialFocus</Code> prop.
      </Text>
      <Preview snippet={snippets.initialFocus} mb="$10">
        <Button onClick={initialFocusDisclosure.onOpen}>Open Modal</Button>
        <Modal
          opened={initialFocusDisclosure.isOpen()}
          initialFocus="#firstname"
          onClose={initialFocusDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Create your account</ModalHeader>
            <ModalBody>
              <FormControl id="firstname" mb="$4">
                <FormLabel>First name</FormLabel>
                <Input placeholder="First name" />
              </FormControl>
              <FormControl id="lastname">
                <FormLabel>Last name</FormLabel>
                <Input placeholder="Last name" />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button onClick={initialFocusDisclosure.onClose}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="close-on-overlay-click">Close modal on overlay click</SectionSubtitle>
      <Text mb="$5">
        By default, the modal closes when you click its overlay. You can set{" "}
        <Code>closeOnOverlayClick</Code> to <Code>false</Code> if you want the modal to stay
        visible.
      </Text>
      <Preview snippet={snippets.closeOnOverlayClick} mb="$10">
        <Button onClick={closeOnOverlayClickDisclosure.onOpen}>Open Modal</Button>
        <Modal
          closeOnOverlayClick={false}
          opened={closeOnOverlayClickDisclosure.isOpen()}
          onClose={closeOnOverlayClickDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>

            <ModalFooter>
              <Button onClick={closeOnOverlayClickDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="modal-vertically-centered">
        Make modal vertically centered
      </SectionSubtitle>
      <Text mb="$5">
        By default the modal has a vertical offset of <Code>3.75rem</Code> which you can change by
        passing <Code>top</Code> to the <Code>ModalContent</Code>. If you need to vertically center
        the modal, pass the <Code>centered</Code> prop.
      </Text>
      <Preview snippet={snippets.centered} mb="$6">
        <Button onClick={centeredDisclosure.onOpen}>Open Modal</Button>
        <Modal centered opened={centeredDisclosure.isOpen()} onClose={centeredDisclosure.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>

            <ModalFooter>
              <Button onClick={centeredDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <Alert status="warning" mb="$10">
        <AlertDescription>
          If the content within the modal overflows beyond the viewport, don't use this prop. Try
          setting the{" "}
          <Anchor href="#overflow-behavior" color="$primary11" fontWeight="$semibold">
            overflow behavior
          </Anchor>{" "}
          instead.
        </AlertDescription>
      </Alert>
      <SectionSubtitle id="changing-transition">Changing the transition</SectionSubtitle>
      <Text mb="$5">
        The <Code>Modal</Code> comes with a scale transition by default but you can change it by
        passing the <Code>motionPreset</Code> prop, and set its value to either{" "}
        <Code>fade-in-bottom</Code>, <Code>scale</Code> or <Code>none</Code>.
      </Text>
      <Preview snippet={snippets.transition} mb="$10">
        <Button onClick={transitionDisclosure.onOpen}>Open Modal</Button>
        <Modal
          motionPreset="fade-in-bottom"
          opened={transitionDisclosure.isOpen()}
          onClose={transitionDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>

            <ModalFooter>
              <Button onClick={transitionDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="overflow-behavior">Modal overflow behavior</SectionSubtitle>
      <Text mb="$3">
        If the content within the modal overflows beyond the viewport, you can use the
        <Code>scrollBehavior</Code> to control how scrolling should happen.
      </Text>
      <UnorderedList spacing="$2" mb="$5">
        <ListItem>
          If set to <Code>inside</Code>, scroll only occurs within the <Code>ModalBody</Code>.
        </ListItem>
        <ListItem>
          If set to <Code>outside</Code>, the entire <Code>ModalContent</Code> will scroll within
          the viewport.
        </ListItem>
      </UnorderedList>
      <Preview snippet={snippets.overflow} mb="$10">
        <RadioGroup value={scrollBehavior()} onChange={setScrollBehavior}>
          <HStack spacing="$4" mb="$4">
            <Radio value="inside">
              <RadioControl />
              <RadioLabel>Inside</RadioLabel>
            </Radio>
            <Radio value="outside">
              <RadioControl />
              <RadioLabel>Outside</RadioLabel>
            </Radio>
          </HStack>
        </RadioGroup>
        <Button onClick={overflowDisclosure.onOpen}>Open Modal</Button>
        <Modal
          scrollBehavior={scrollBehavior() as ModalProps["scrollBehavior"]}
          opened={overflowDisclosure.isOpen()}
          onClose={overflowDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos blanditiis accusamus
                in praesentium dolorem, sunt quia sit sequi minima maxime? Eius natus, aut omnis
                deserunt nostrum fugiat! Totam magni sapiente maxime maiores aut doloremque veniam
                excepturi, id quae veritatis est omnis, nesciunt ipsum, voluptate adipisci nam sed
                ea inventore facere nulla optio aliquid? Aliquid iure, optio et fuga quo dicta
                ratione impedit praesentium mollitia maiores ipsa, magni sapiente reiciendis
                perspiciatis. Molestiae quisquam eveniet aliquam consequatur accusantium quasi ut
                sint animi reiciendis. Suscipit numquam commodi fuga provident? Voluptatem dicta
                exercitationem nemo beatae cum consequuntur pariatur quidem magni sed tempore. Eaque
                itaque totam quae incidunt quidem officia atque libero placeat? Obcaecati, ullam
                dolores velit sequi magni animi inventore earum error maiores et, sunt numquam illo
                fugiat ducimus in aspernatur possimus minus, placeat blanditiis alias. Deleniti
                corrupti eaque debitis adipisci, doloremque rerum temporibus saepe error! Fugiat
                inventore possimus doloribus, nemo qui, nostrum alias non tempora nam itaque quae
                maiores tempore, quasi blanditiis incidunt aut. Sapiente sit distinctio adipisci.
                Consectetur numquam ratione facere fuga ipsum quasi aliquam velit illum iure
                consequuntur, repellat cumque quibusdam dolorem asperiores perspiciatis ducimus.
                Quod earum alias nihil voluptate inventore dolores mollitia natus saepe esse. Aut
                assumenda nulla maxime recusandae nihil iusto dicta commodi pariatur veritatis?
                Impedit nam deserunt optio aspernatur praesentium totam illum facere id
                exercitationem veniam eveniet vitae obcaecati minima, similique rerum suscipit
                dolorum tempora perferendis voluptatem ex ipsam! Ut ea, sapiente cum, adipisci ab
                voluptatem enim, explicabo illo sunt exercitationem ipsum doloribus? Consectetur
                impedit voluptatibus culpa aperiam facere, animi placeat ea corrupti quidem
                repellendus sed saepe accusamus autem delectus enim, in soluta minus laboriosam
                adipisci! Numquam quod dolorem eum tempora totam, assumenda nostrum eligendi aliquam
                rerum dignissimos autem quo. Qui fugit, aperiam sequi quis exercitationem quisquam
                nobis facilis debitis placeat quia temporibus distinctio maiores animi nisi
                voluptatum accusamus laudantium non dolore? Dolorem eum vitae modi ipsam quibusdam
                tempora natus obcaecati in, expedita fugit. Explicabo quae accusantium porro unde
                dolores maxime ullam optio enim quibusdam fugit veritatis excepturi ad, molestias
                natus tenetur esse rerum et ab rem cupiditate, dicta aspernatur corrupti deleniti
                iste. Aspernatur repellendus, voluptates omnis, hic quod minima laudantium officiis
                aliquam quasi voluptatibus voluptatum provident soluta suscipit ea illum amet fugit
                blanditiis velit exercitationem assumenda inventore rerum nihil! Inventore
                reprehenderit distinctio non veniam eum beatae nihil reiciendis nemo est molestias
                qui, dolorum praesentium explicabo id culpa nostrum repudiandae recusandae! Vero ut
                placeat, fugiat, aliquam quos omnis similique temporibus iusto nulla non rerum
                repellat repudiandae illum sit sapiente. Iusto et qui eaque odit eum culpa ipsa,
                libero, perspiciatis voluptatem quaerat aperiam assumenda. Architecto minus
                doloremque sed numquam aperiam, ratione dolorem dolores odio obcaecati quis nemo sit
                delectus voluptatum possimus ad maxime et officia minima nulla illum eum quos
                molestiae laboriosam. Nihil harum voluptates, ea consequatur tenetur, nulla
                explicabo fugiat earum veritatis doloribus maxime deleniti nostrum quos praesentium
                voluptate commodi quas assumenda fuga et placeat? Quam repudiandae, tempore
                consequuntur aperiam itaque in omnis et ut unde, temporibus alias maiores
                distinctio, nihil culpa. Fugiat quasi quisquam eaque facilis totam.
              </p>
            </ModalBody>

            <ModalFooter>
              <Button onClick={overflowDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="modal-sizes">Modal sizes</SectionSubtitle>
      <Text mb="$5">
        Pass the <Code>size</Code> prop if you need to adjust the size of the modal. Values can be{" "}
        <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>, <Code>xl...8xl</Code>,
        or <Code>full</Code>.
      </Text>
      <Preview snippet={snippets.sizes} mb="$10">
        <For each={sizes}>
          {size => (
            <Button
              onClick={() => handleSizeClick(size as ModalProps["size"])}
              m="$4"
            >{`Open ${size} Modal`}</Button>
          )}
        </For>

        <Modal opened={sizeDisclosure.isOpen()} size={size()} onClose={sizeDisclosure.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={sizeDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="prevent-focus-trapping">Prevent focus trapping</SectionSubtitle>
      <Text mb="$5">
        By default the modal and drawer locks the focus inside them. Normally this is what you want
        to maintain accessibility standards.
      </Text>
      <Text mb="$5">
        <strong>While strongly discourage this use case</strong> due to the accessibility impacts,
        there are certain situations where you might not want the modal to trap focus.
      </Text>
      <Text mb="$5">
        To prevent focus trapping, pass <Code>trapFocus</Code> and set its value to{" "}
        <Code>false</Code>.
      </Text>
      <Preview snippet={snippets.trapFocus} mb="$10">
        <Button onClick={trapFocusDisclosure.onOpen}>Open Modal</Button>
        <Modal
          trapFocus={false}
          opened={trapFocusDisclosure.isOpen()}
          onClose={trapFocusDisclosure.onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <Text fontWeight="$bold">You can focus on the content behind the modal</Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={trapFocusDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <SectionSubtitle id="styling-backdrop">Styling the backdrop</SectionSubtitle>
      <Text mb="$5">
        The backdrop's background by default is set to <Code>$blackAlpha11</Code>, but if you want
        to achieve a different style you can use style props.
      </Text>
      <Preview snippet={snippets.backdropStyle} mb="$6">
        <Button onClick={backdropStyleDisclosure.onOpen}>Open Modal</Button>
        <Modal opened={backdropStyleDisclosure.isOpen()} onClose={backdropStyleDisclosure.onClose}>
          <ModalOverlay
            bg="$blackAlpha3"
            css={{
              backdropFilter: "blur(10px) hue-rotate(90deg)",
            }}
          />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Modal Title</ModalHeader>
            <ModalBody>
              <p>Some contents...</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={backdropStyleDisclosure.onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          Please be aware that not every browser supports the <Code>backdrop-filter</Code> CSS
          property, used in the example above.
        </AlertDescription>
      </Alert>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          The <Code>ModalContent</Code> has <Code>aria-modal</Code> set to <Code>true</Code>.
        </ListItem>
        <ListItem>
          The <Code>ModalContent</Code> has <Code>aria-labelledby</Code> set to the <Code>id</Code>{" "}
          of the <Code>ModalHeader</Code>.
        </ListItem>
        <ListItem>
          The <Code>ModalContent</Code> has <Code>aria-describedby</Code> set to the <Code>id</Code>{" "}
          of the <Code>ModalBody</Code>.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support and Focus management</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>When the modal opens, focus is trapped within it.</ListItem>
        <ListItem>
          When the modal opens, focus is automatically set to the first enabled element, or the
          element from <Code>initialFocus</Code>.
        </ListItem>
        <ListItem>Clicking on the overlay closes the Modal.</ListItem>
        <ListItem>
          Pressing <Kbd>esc</Kbd> closes the Modal.
        </ListItem>
        <ListItem>Scrolling is blocked on the elements behind the modal.</ListItem>
        <ListItem>
          The modal is rendered in a portal attached to the end of <Code>document.body</Code> to
          break it out of the source order.
        </ListItem>
      </UnorderedList>

      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Modal</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="modal-props">Modal props</SectionSubtitle>
      <PropsTable items={propItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <UnorderedList spacing="$2">
        <ListItem>
          <Code>ModalOverlay</Code>, <Code>ModalContent</Code>, <Code>ModalHeader</Code>,{" "}
          <Code>ModalBody</Code> and <Code>ModalFooter</Code> composes{" "}
          <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
            Box
          </Anchor>
          .
        </ListItem>
        <ListItem>
          <Code>ModalCloseButton</Code> composes{" "}
          <Anchor
            as={Link}
            href="/docs/others/close-button"
            color="$primary11"
            fontWeight="$semibold"
          >
            CloseButton
          </Anchor>
          .
        </ListItem>
      </UnorderedList>
    </PageLayout>
  );
}
