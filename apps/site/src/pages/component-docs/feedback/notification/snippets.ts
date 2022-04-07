const importComponent = `import { 
  NotificationsProvider, 
  Notification,
  NotificationIcon,
  NotificationTitle,
  NotificationDescription,
  notificationService,
} from "@hope-ui/solid"`;

const setup = `// 1. import \`NotificationsProvider\` component
import { HopeProvider, NotificationsProvider } from '@hope-ui/solid'

// 2. Wrap NotificationsProvider at the root of your app
function App() {
  return (
    <HopeProvider>
      <NotificationsProvider>
        <MyApp />
      </NotificationsProvider>
    </HopeProvider>
  )
}`;

const basicUsage = `import { notificationService } from '@hope-ui/solid'

function NotificationExample() {
  const showNotification = () => {
    notificationService.show({
      title: "Default notification",
      description: "Hey there, your code is awesome! 🤥",
    })
  }

  return (
    <Button onClick={showNotification}>
      Show notification
    </Button>
  );
}`;

const status = `<Button
  onClick={() =>
      notificationService.show({
        status: "info", /* or success, warning, danger */
        title: "Info notification",
        description: "Hey there, your code is awesome! 🤥",
      });
  }
>
  Show notification
</Button>`;

const placement = `import { HopeProvider, NotificationsProvider } from '@hope-ui/solid'

function App() {
  return (
    <HopeProvider>
      <NotificationsProvider placement="bottom-end">
        <MyApp />
      </NotificationsProvider>
    </HopeProvider>
  )
}`;

const duration = `<Button
  onClick={() =>
    notificationService.show({
      title: "Custom duration",
      description: "notification will be closed in 10 seconds",
      duration: 10_000, /* duration in ms */
    })
  }
>
  Show 10 seconds notification
</Button>`;

const persistent = `<Button
  onClick={() =>
    notificationService.show({
      title: "I will never close",
      description: "unless you click X",
      persistent: true,
    })
  }
>
  Show persistent notification
</Button>`;

const customComponent = `<Button
  onClick={() =>
    notificationService.show({
      render: props => (
        <HStack
          bg="$loContrast"
          rounded="$md"
          border="1px solid $neutral7"
          shadow="$lg"
          p="$4"
          w="$sm"
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
</Button>`;

const hidding = `<HStack spacing="$4">
  <Button
    onClick={() =>
      notificationService.show({
        id: "notification-id", /* set a custom id */
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
    onClick={() => notificationService.hide("notification-id")} // use the same id
  >
    Hide notification
  </Button>
</HStack>`;

const updating = `<Button
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
  Show upadate notification
</Button>`;

const limitAndQueueSetup = `import { HopeProvider, NotificationsProvider } from '@hope-ui/solid'

function App() {
  return (
    <HopeProvider>
      <NotificationsProvider limit={10}>
        <MyApp />
      </NotificationsProvider>
    </HopeProvider>
  )
}`;

const limitAndQueue = `<HStack spacing="$4">
  <Button
    onClick={() => {
      Array(20).fill(0).forEach((_, index) => {
        notificationService.show({
          title: \`Notification \${index + 1}\`,
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
  <Button 
    colorScheme="danger" 
    variant="subtle" 
    onClick={() => notificationService.clear()}
  >
    Clear all
  </Button>
</HStack>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Notification: {
      baseStyle: {
        root: SystemStyleConfig,
        icon: SystemStyleConfig,
        title: SystemStyleConfig,
        description: SystemStyleConfig,
      },
      defaultProps: {
        root: ThemeableNotificationOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  setup,
  basicUsage,
  status,
  placement,
  duration,
  persistent,
  customComponent,
  hidding,
  updating,
  limitAndQueueSetup,
  limitAndQueue,
  theming,
};
