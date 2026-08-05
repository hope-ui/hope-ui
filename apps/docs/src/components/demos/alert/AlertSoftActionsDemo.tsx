import { Alert } from "@hope-ui/components/alert";
import { Button } from "@hope-ui/components/button";
import { CircleCheckIcon } from "~/components/Icons";

// Live demo for "Actions on a soft or subtle alert". A `soft` alert is a tinted surface, and a
// `ghost` button's hover wash is a fixed shade in the same tier as that tint — so a ghost secondary
// action here would wash to the alert's own background and show no hover at all. The Button
// `adaptive` variant inherits the alert's text color and mixes its wash from that, which is why it
// takes no `colorScheme`.
export function AlertSoftActionsDemo() {
  return (
    <div class="not-prose w-full max-w-lg">
      <Alert.Root variant="soft" colorScheme="success">
        <Alert.Icon>
          <CircleCheckIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Deployment finished</Alert.Title>
          <Alert.Description>acme-web #128 is live on preview.</Alert.Description>
          <Alert.Actions>
            <Button variant="solid" colorScheme="success" size="sm">
              Visit preview
            </Button>
            <Button variant="adaptive" size="sm">
              View logs
            </Button>
          </Alert.Actions>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
