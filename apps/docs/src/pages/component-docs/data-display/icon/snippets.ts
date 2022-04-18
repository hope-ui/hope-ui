const importComponent = `import { Icon } from "@hope-ui/design-system"`;

const usingThirdPartyIconLibrary = `// 1. Import
import { Icon } from "@hope-ui/design-system"
import { SettingsIcon } from "some-icon-library"

// 2. Use the \`as\` prop
function Example() {
  return <Icon as={SettingsIcon} />
}`;

const importIconAndCreateIcon = `import { Icon, createIcon } from "@hope-ui/design-system"`;

const customIconWithIconComponent = `<Icon viewBox="0 0 200 200" color="$danger9">
  <path
    fill="currentColor"
    d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
  />
</Icon>`;

const customIconAsComponent = `function CircleIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 200 200" {...props}>
      <path 
        fill="currentColor" 
        d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" 
      />
    </Icon>
  );
}`;

const customIconAsComponentUsage = `<HStack>
  {/* The default icon size is 1em (16px) */}
  <CircleIcon />

  {/* Use the \`boxSize\` prop to change the icon size */}
  <CircleIcon boxSize="$6" />

  {/* Use the \`color\` prop to change the icon color */}
  <CircleIcon boxSize="$8" color="$danger9" />
</HStack>`;

const createIconExample = `import { createIcon } from "@hope-ui/design-system"

export const CircleIcon = createIcon({
  viewBox: "0 0 200 200",
  // path is a function that returns JSX
  path: () => (
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  ),
})
`;

const fallbackIcon = `<Icon />`;

export const snippets = {
  importComponent,
  usingThirdPartyIconLibrary,
  importIconAndCreateIcon,
  customIconWithIconComponent,
  customIconAsComponent,
  customIconAsComponentUsage,
  createIconExample,
  fallbackIcon,
};
