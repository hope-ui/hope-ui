import { Alert } from "@hope-ui/components/alert";
import { Button } from "@hope-ui/components/button";
import { InfoIcon } from "~/components/Icons";

// Live demo for the "Actions" section: the compound anatomy with an `Alert.Actions` row
// under the description. Actions belong INSIDE `Alert.Content` (below the text), so the
// buttons align with the copy rather than the icon. Real hope-ui Buttons, colored to the
// alert's role.
export function AlertActionsDemo() {
  return (
    <div class="not-prose w-full max-w-lg">
      <Alert.Root colorScheme="warning">
        <Alert.Icon>
          <InfoIcon class="rotate-180" />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Your trial ends in 3 days</Alert.Title>
          <Alert.Description>
            Upgrade now to keep your projects, integrations, and history.
          </Alert.Description>
          <Alert.Actions>
            <Button variant="solid" colorScheme="warning" size="sm">
              Upgrade plan
            </Button>
            <Button variant="ghost" colorScheme="warning" size="sm">
              Remind me later
            </Button>
          </Alert.Actions>
        </Alert.Content>
      </Alert.Root>
    </div>
  );
}
