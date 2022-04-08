const importComponent = `import { Progress, ProgressIndicator, ProgressLabel } from "@hope-ui/solid"`;

const basicUsage = `<Progress value={80}>
  <ProgressIndicator />
</Progress>`;

const colors = `<Progress trackColor="$info3" value={64}>
  <ProgressIndicator color="$info9" />
</Progress>`;

const sizes = `<VStack alignItems="stretch" spacing="$5">
  <Progress size="xs" value={20}>
    <ProgressIndicator />
  </Progress>
  <Progress size="sm" value={20}>
    <ProgressIndicator />
  </Progress>
  <Progress size="md" value={20}>
    <ProgressIndicator />
  </Progress>
  <Progress size="lg" value={20}>
    <ProgressIndicator />
  </Progress>
  <Progress height="32px" value={20}>
    <ProgressIndicator />
  </Progress>
</VStack>`;

const withLabel = `<Progress size="lg" value={80}>
  <ProgressIndicator />
  <ProgressLabel />
</Progress>`;

const striped = `<Progress value={64}>
  <ProgressIndicator striped />
</Progress>`;

const animated = `<Progress value={64}>
  <ProgressIndicator striped animated />
</Progress>`;

const indeterminate = `<Progress size="xs" indeterminate>
  <ProgressIndicator />
</Progress>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Progress: {
      baseStyle: {
        track: SystemStyleObject,
        indicator: SystemStyleObject,
        label: SystemStyleObject
      },
      defaultProps: {
        root: ThemeableProgressOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  colors,
  sizes,
  withLabel,
  striped,
  animated,
  indeterminate,
  theming,
};
