const importComponent = `import { 
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@hope-ui/design-system"`;

const basicUsage = `<Alert status="danger">
  <AlertIcon mr="$2_5" />
  <AlertTitle mr="$2_5">Your browser is outdated!</AlertTitle>
  <AlertDescription>Your Hope UI experience may be degraded.</AlertDescription>
  <CloseButton position="absolute" right="8px" top="8px" />
</Alert>`;

const status = `<VStack alignItems="stretch" spacing="$4">
  <Alert status="info">
    <AlertIcon mr="$2_5" />
    Hope UI is going live on April 7th. Get ready!
  </Alert>

  <Alert status="success">
    <AlertIcon mr="$2_5" />
    Data uploaded to the server. Fire on!
  </Alert>

  <Alert status="warning">
    <AlertIcon mr="$2_5" />
    Seems your account is about expire, upgrade now
  </Alert>

  <Alert status="danger">
    <AlertIcon mr="$2_5" />
    There was an error processing your request
  </Alert>
</VStack>`;

const variants = `<VStack alignItems="stretch" spacing="$4">
  <Alert status="success" variant="solid">
    <AlertIcon mr="$2_5" />
    Data uploaded to the server. Fire on!
  </Alert>

  <Alert status="success" variant="subtle">
    <AlertIcon mr="$2_5" />
    Data uploaded to the server. Fire on!
  </Alert>

  <Alert status="success" variant="left-accent">
    <AlertIcon mr="$2_5" />
    Data uploaded to the server. Fire on!
  </Alert>

  <Alert status="success" variant="top-accent">
    <AlertIcon mr="$2_5" />
    Data uploaded to the server. Fire on!
  </Alert>
</VStack>`;

const composition = `<Alert
  status="success"
  variant="subtle"
  flexDirection="column"
  justifyContent="center"
  textAlign="center"
  height="200px"
>
  <AlertIcon boxSize="40px" mr="0" />
  <AlertTitle mt="$4" mb="$1" fontSize="$lg">
    Application submitted!
  </AlertTitle>
  <AlertDescription maxWidth="$sm">
    Thanks for submitting your application. Our team will get back to you soon.
  </AlertDescription>
</Alert>`;

const compositionTwo = `<Alert status="success">
  <AlertIcon mr="$2_5" />
  <Box flex="1">
    <AlertTitle>Success!</AlertTitle>
    <AlertDescription display="block">
      Your application has been received. 
      We will review your application and respond within the next 48 hours.
    </AlertDescription>
  </Box>
  <CloseButton position="absolute" right="8px" top="8px" />
</Alert>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Alert: {
      baseStyle: {
        root: SystemStyleConfig,
        icon: SystemStyleConfig,
        title: SystemStyleConfig,
        description: SystemStyleConfig,
      },
      defaultProps: {
        root: ThemeableAlertOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  status,
  variants,
  composition,
  compositionTwo,
  theming,
};
