import { Alert } from "@hope-ui/components/alert";
import { Button } from "@hope-ui/components/button";
import { InfoIcon } from "~/components/Icons";

// Live demo for "Actions on a solid alert". A `solid` alert is a filled role-colored banner, so a
// `solid` action button would blend into it. The Button `inverted` variant is the surface-aware
// pairing — a contrasting fill that stays legible on a solid, colored surface — so both actions here
// use it (the role for the primary CTA, neutral for the secondary).
export function AlertSolidActionsDemo() {
  return (
    <div class="not-prose w-full max-w-lg">
      <Alert.Root variant="solid" colorScheme="danger">
        <Alert.Icon>
          <InfoIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Your payment failed</Alert.Title>
          <Alert.Description>Update your card to keep your subscription active.</Alert.Description>
          <Alert.Actions>
            <Button variant="inverted" colorScheme="danger" size="sm">
              Update payment
            </Button>
            <Button variant="inverted" colorScheme="neutral" size="sm">
              Dismiss
            </Button>
          </Alert.Actions>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
