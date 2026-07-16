import { Button } from "@hope-ui/components/button";

// A small gallery of the hope-ui Button across variants, colorSchemes, and states.
export function ButtonDemo() {
  return (
    <div class="flex flex-wrap items-center gap-3 not-prose">
      <Button variant="solid" colorScheme="primary">
        Primary
      </Button>
      <Button variant="soft" colorScheme="success">
        Soft success
      </Button>
      <Button variant="outline" colorScheme="danger">
        Outline danger
      </Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="solid" colorScheme="primary" loading>
        Loading
      </Button>
    </div>
  );
}
