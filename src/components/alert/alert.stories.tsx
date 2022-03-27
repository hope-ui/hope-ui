import { HopeWrapper } from "@/utils/storybook";

import { VStack } from "../stack/stack";
import { Alert } from "./alert";
import { AlertDescription } from "./alert-description";
import { AlertIcon } from "./alert-icon";
import { AlertTitle } from "./alert-title";

export default {
  title: "Feedback/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "subtle", "left-accent", "top-accent"],
    },
    children: {
      control: { type: "text" },
    },
  },
  args: {
    variant: "subtle",
    children: "Hope UI is going live on April 7th. Get ready!",
  },
};

export const Default = (args: any) => (
  <VStack spacing="$4">
    <Alert status="success" {...args} />
    <Alert status="info" {...args} />
    <Alert status="warning" {...args} />
    <Alert status="danger" {...args} />
  </VStack>
);

export const WithTitleAndDescription = (args: any) => (
  <VStack alignItems="flex-start" spacing="$4">
    <Alert status="success" variant={args.variant}>
      <AlertTitle mr="$2">Success</AlertTitle>
      <AlertDescription>{args.children}</AlertDescription>
    </Alert>
    <Alert status="info" variant={args.variant}>
      <AlertTitle mr="$2">Info</AlertTitle>
      <AlertDescription>{args.children}</AlertDescription>
    </Alert>
    <Alert status="warning" variant={args.variant}>
      <AlertTitle mr="$2">Warning</AlertTitle>
      <AlertDescription>{args.children}</AlertDescription>
    </Alert>
    <Alert status="danger" variant={args.variant}>
      <AlertTitle mr="$2">Danger</AlertTitle>
      <AlertDescription>{args.children}</AlertDescription>
    </Alert>
  </VStack>
);
WithTitleAndDescription.storyName = "With title and description";

export const WithIcon = (args: any) => (
  <VStack spacing="$4">
    <Alert status="success" variant={args.variant}>
      <AlertIcon />
      {args.children}
    </Alert>
    <Alert status="info" variant={args.variant}>
      <AlertIcon />
      {args.children}
    </Alert>
    <Alert status="warning" variant={args.variant}>
      <AlertIcon />
      {args.children}
    </Alert>
    <Alert status="danger" variant={args.variant}>
      <AlertIcon />
      {args.children}
    </Alert>
  </VStack>
);
WithIcon.storyName = "With icon";

export const Custom = (args: any) => (
  <Alert
    status="success"
    variant={args.variant}
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    height="200px"
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt="$4" mb="$1" fontSize="$lg">
      Application submitted!
    </AlertTitle>
    <AlertDescription maxWidth="$sm">
      Thanks for submitting your application. Our team will get back to you soon.
    </AlertDescription>
  </Alert>
);
