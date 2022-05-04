import {
  Avatar,
  Button,
  HStack,
  ListItem,
  NotificationProps,
  notificationService,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
import Prism from "prismjs";
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

import { snippets } from "./snippets";

export default function SpinnerDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/feedback/spinner",
    label: "Spinner",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/overlay/drawer",
    label: "Drawer",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    {
      href: "#notification-service-api",
      label: "The `notificationService` API",
      indent: true,
    },
    { href: "#notification-status", label: "Notification status", indent: true },
    { href: "#notification-placement", label: "Notification placement", indent: true },
    { href: "#notification-duration", label: "Notification duration", indent: true },
    { href: "#persistent-notification", label: "Persistent notification", indent: true },
    { href: "#using-custom-component", label: "Using custom component", indent: true },
    { href: "#updating-notification", label: "Updating notification", indent: true },
    { href: "#hidding-notification", label: "Hidding notification", indent: true },
    { href: "#limit-and-queue", label: "Limit and queue", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#notifications-provider-props", label: "NotificationsProvider props", indent: true },
    { href: "#notification-props", label: "Notification props", indent: true },
    {
      href: "#notification-service-show",
      label: "notificationService.show",
      indent: true,
    },
    {
      href: "#notification-service-update",
      label: "notificationService.update",
      indent: true,
    },
    {
      href: "#notification-service-hide",
      label: "notificationService.hide",
      indent: true,
    },
  ];

  const notificationsProviderPropItems: PropsTableItem[] = [
    {
      name: "placement",
      description: "The placement of all notifications",
      type: '"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"',
      defaultValue: '"top-end"',
    },
    {
      name: "limit",
      description:
        "Maximum amount of notifications displayed at a time, other new notifications will be added to queue.",
      type: "number",
      defaultValue: "10",
    },
    {
      name: "duration",
      description: "The delay (in ms) before notifications hides.",
      type: "number",
      defaultValue: "5000",
    },
    {
      name: "persistent",
      description: "If `true`, duration will be ignored and notifications will never dismiss.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "closable",
      description: "If `true`, notifications will show a close button.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "zIndex",
      description: "The `z-index` css property of the notifications container.",
      type: 'PositionProps["zIndex"]',
      defaultValue: "$notification",
    },
  ];

  const notificationPropItems: PropsTableItem[] = [
    {
      name: "status",
      description: "The status of the notification. This affects the color scheme and icon used.",
      type: '"success" | "info" | "warning" | "danger"',
    },
  ];

  const notificationServiceShowPropItems: PropsTableItem[] = [
    {
      name: "id",
      description:
        "The id of the notification, used to update and remove notification. By default, a unique id is generated for each notification.",
      type: "string",
    },
    {
      name: "status",
      description: "The status of the notification.",
      type: '"success" | "info" | "warning" | "danger"',
    },
    {
      name: "title",
      description: "The title of the notification.",
      type: "string",
    },
    {
      name: "description",
      description: "The description of the notification.",
      type: "string",
    },
    {
      name: "duration",
      description: "The delay (in ms) before the notification hides.",
      type: "number",
      defaultValue: "5000",
    },
    {
      name: "persistent",
      description: "If `true`, duration will be ignored and the notification will never dismiss.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "closable",
      description: "If `true`, the notification will show a close button.",
      type: "boolean",
      defaultValue: "true",
    },
    {
      name: "loading",
      description: "If `true`, the notification will show a loader.",
      type: "boolean",
    },
    {
      name: "onClose",
      description: "Callback function to run side effects after the notification has closed.",
      type: "(id: string) => void",
    },
    {
      name: "render",
      description:
        "Render a custom component. It will receive the notification `id` and a `close` function as render props.",
      type: "(props: NotificationConfigRenderProps) => JSX.Element",
    },
  ];

  const notificationServiceHidePropItems: PropsTableItem[] = [
    {
      required: true,
      name: "id",
      description: "The `id` of the notification.",
      type: "string",
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
      <PageTitle>Notification</PageTitle>
      <Text mb="$5">Notification give feedback to users after an action has taken place.</Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>NotificationsProvider:</strong> The component that provides the notification
          system.
        </ListItem>
        <ListItem>
          <strong>Notification:</strong> The wrapper for notification components.
        </ListItem>
        <ListItem>
          <strong>NotificationIcon:</strong> The visual icon for the notification that changes based
          on the <Code>status</Code> prop.
        </ListItem>
        <ListItem>
          <strong>NotificationTitle:</strong> The title of the notification.
        </ListItem>
        <ListItem>
          <strong>NotificationDescription:</strong> The description of the notification.
        </ListItem>
        <ListItem>
          <strong>notificationService:</strong> An utility object used to show/hide notifications.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5">
        Wrap your application with the <Code>NotificationsProvider</Code>:
      </Text>
      <CodeSnippet snippet={snippets.setup} mb="$6" />
      <Text mb="$5">
        Then use the <Code>notificationService</Code> anywhere in your application:
      </Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Button
          onClick={() =>
            notificationService.show({
              title: "Default notification",
              description: "Hey there, your code is awesome! 🤥",
            })
          }
        >
          Show notification
        </Button>
      </Preview>
      <SectionSubtitle id="notification-service-api">
        The <Code>notificationService</Code> API
      </SectionSubtitle>
      <Text mb="$3">
        The notification system is based on custom events, Hope UI exports the following methods
        through the <Code>notificationService</Code> object:
      </Text>
      <UnorderedList spacing="$2" mb="$10">
        <ListItem>
          <strong>show:</strong> adds given notification to notifications list or queue depending on
          current state and limit.
        </ListItem>
        <ListItem>
          <strong>update:</strong> updates notification that was previously added to the state or
          queue.
        </ListItem>
        <ListItem>
          <strong>hide:</strong> removes notification with given id from notifications state and
          queue.
        </ListItem>
        <ListItem>
          <strong>clear:</strong> removes all notifications from notifications state and queue.
        </ListItem>
        <ListItem>
          <strong>clearQueue:</strong> removes all notifications from queue.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle id="notification-status">Notification status</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>status</Code> parameter to change the status of the notification, this affects
        the icon used. You can set the value to <Code>success</Code>, <Code>info</Code>,{" "}
        <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.status} mb="$10">
        <Button
          onClick={() =>
            ["success", "info", "warning", "danger"].forEach(status => {
              notificationService.show({
                status: status as NotificationProps["status"],
                title: `${status} notification`,
                description: "Hey there, your code is awesome! 🤥",
              });
            })
          }
        >
          Show all notification statuses
        </Button>
      </Preview>
      <SectionSubtitle id="notification-placement">Notification placement</SectionSubtitle>
      <Text mb="$5">
        <Code>NotificationsProvider</Code> renders notifications with fixed position inside a
        Portal. Position cannot be changed per notification. Use the <Code>placement</Code> prop to
        define the placement. You can set the value to <Code>top-start</Code>, <Code>top</Code>,{" "}
        <Code>top-end</Code>, <Code>bottom-start</Code>, <Code>bottom</Code> or{" "}
        <Code>bottom-end</Code>.
      </Text>
      <CodeSnippet snippet={snippets.placement} mb="$10" />
      <SectionSubtitle id="notification-duration">Notification duration</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>duration</Code> parameter to change the duration of the notification. By
        default, notitification will dismiss after 5 seconds.
      </Text>
      <Preview snippet={snippets.duration} mb="$10">
        <Button
          onClick={() =>
            notificationService.show({
              title: "Custom duration",
              description: "notification will be closed in 10 seconds",
              duration: 10_000,
            })
          }
        >
          Show 10 seconds notification
        </Button>
      </Preview>
      <SectionSubtitle id="persistent-notification">Persistent notification</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>persistent</Code> parameter to make the notification persistent. the duration
        will be ignored.
      </Text>
      <Preview snippet={snippets.persistent} mb="$10">
        <Button
          onClick={() =>
            notificationService.show({
              title: "I will never close",
              description: "unless you click X",
              persistent: true,
            })
          }
        >
          Show persistent notification
        </Button>
      </Preview>
      <SectionSubtitle id="using-custom-component">Using custom component</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>render</Code> parameter to display a custom component instead of the default
        Hope UI <Code>Notification</Code>.
      </Text>
      <Preview snippet={snippets.customComponent} mb="$10">
        <Button
          onClick={() =>
            notificationService.show({
              render: props => (
                <HStack
                  bg="$loContrast"
                  rounded="$md"
                  border="1px solid $neutral7"
                  shadow="$lg"
                  p="$4"
                  w="$full"
                >
                  <Avatar name="Courtney Watson" src="https://bit.ly/3w2rgom" mr="$3" />
                  <VStack alignItems="flex-start">
                    <Text size="sm" fontWeight="$medium">
                      Courtney Watson
                    </Text>
                    <Text size="sm" color="$neutral11">
                      Sure! 8:30pm works great!
                    </Text>
                  </VStack>
                  <Button
                    variant="ghost"
                    colorScheme="accent"
                    size="sm"
                    ml="auto"
                    onClick={() => props.close()}
                  >
                    Reply
                  </Button>
                </HStack>
              ),
            })
          }
        >
          Show custom notification
        </Button>
      </Preview>
      <SectionSubtitle id="updating-notification">Updating notification</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>update</Code> method to update a specific notification. This method takes the
        same parameters as the <Code>show</Code> method except that <Code>id</Code> is required.
      </Text>
      <Preview snippet={snippets.updating} mb="$10">
        <Button
          onClick={() => {
            notificationService.show({
              id: "notification-id",
              title: "Loading your data",
              description: "Data will be loaded in 3 seconds, you cannot close this yet",
              persistent: true,
              closable: false,
              loading: true,
            });

            setTimeout(() => {
              notificationService.update({
                id: "notification-id",
                status: "success",
                title: "Data was loaded",
                description: "Notification will close in 2 seconds",
                duration: 2_000,
              });
            }, 3_000);
          }}
        >
          Show update notification
        </Button>
      </Preview>
      <SectionSubtitle id="hidding-notification">Hidding notification</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>hide</Code> method to dismiss a specific notification by passing its
        notification id.
      </Text>
      <Preview snippet={snippets.hidding} mb="$10">
        <HStack spacing="$4">
          <Button
            onClick={() =>
              notificationService.show({
                id: "notification-id",
                title: "Hidding notification",
                description: "Hey, you can't hide me...unless using the 'Hide' button",
                persistent: true,
                closable: false,
              })
            }
          >
            Show notification
          </Button>
          <Button
            variant="subtle"
            colorScheme="neutral"
            onClick={() => notificationService.hide("notification-id")}
          >
            Hide notification
          </Button>
        </HStack>
      </Preview>
      <SectionSubtitle id="limit-and-queue"> Limit and queue</SectionSubtitle>
      <Text mb="$5">
        <Code>NotificationsProvider</Code> uses a queue to manage its state. You can limit maximum
        amount of notifications that can be displayed by setting the <Code>limit</Code> prop.
      </Text>
      <CodeSnippet snippet={snippets.limitAndQueueSetup} mb="$6" />
      <Text mb="$3">
        All notifications added after limit was reached will be added into queue and displayed when
        notification from current state is closed.
      </Text>
      <Text mb="$5">
        You can use the <Code>clearQueue</Code> method to remove all notifications that are not
        currently displayed and the <Code>clear</Code> method to remove all notifications from state
        and queue.
      </Text>
      <Preview snippet={snippets.limitAndQueue} mb="$12">
        <HStack spacing="$4">
          <Button
            onClick={() => {
              Array(20)
                .fill(0)
                .forEach((_, index) => {
                  notificationService.show({
                    title: `Notification ${index + 1}`,
                    description: "Most notifications are added to queue",
                  });
                });
            }}
          >
            Show 20 notifications
          </Button>
          <Button
            colorScheme="neutral"
            variant="subtle"
            onClick={() => notificationService.clearQueue()}
          >
            Clear queue
          </Button>
          <Button colorScheme="danger" variant="subtle" onClick={() => notificationService.clear()}>
            Clear all
          </Button>
        </HStack>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Notification</Code> base styles and default props can be overridden in the Hope UI
        theme configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="notifications-provider-props">
        NotificationsProvider props
      </SectionSubtitle>
      <PropsTable items={notificationsProviderPropItems} mb="$10" />
      <SectionSubtitle id="notification-props">Notification props</SectionSubtitle>
      <PropsTable items={notificationPropItems} mb="$10" />
      <SectionSubtitle id="notification-service-show">
        notificationService.<Code>show</Code>
      </SectionSubtitle>
      <PropsTable items={notificationServiceShowPropItems} mb="$10" />
      <SectionSubtitle id="notification-service-update">
        notificationService.<Code>update</Code>
      </SectionSubtitle>
      <Text mb="$10">
        The <Code>update</Code> method takes the same parameters as the <Code>show</Code> method
        except that <Code>id</Code> is required.
      </Text>
      <SectionSubtitle id="notification-service-hide">
        notificationService.<Code>hide</Code>
      </SectionSubtitle>
      <PropsTable items={notificationServiceHidePropItems} mb="$10" />
    </PageLayout>
  );
}
