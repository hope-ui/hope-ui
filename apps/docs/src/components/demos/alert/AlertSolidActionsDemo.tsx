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
      <Alert.Root variant="solid" colorScheme="info">
        <Alert.Icon>
          <InfoIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>A new version is available</Alert.Title>
          <Alert.Description>Reload to get the latest features and fixes.</Alert.Description>
          <Alert.Actions>
            <Button variant="inverted" colorScheme="info" size="sm">
              Reload
            </Button>
            <Button variant="inverted" colorScheme="neutral" size="sm">
              Later
            </Button>
          </Alert.Actions>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
