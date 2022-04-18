const importComponent = `import { 
  CircularProgress, 
  CircularProgressIndicator,
  CircularProgressLabel 
} from "@hope-ui/design-system"`;

const basicUsage = `<CircularProgress value={80}>
  <CircularProgressIndicator />
</CircularProgress>`;

const color = `<CircularProgress trackColor="$info3" value={64}>
  <CircularProgressIndicator color="$info9" />
</CircularProgress>`;

const size = `<CircularProgress value={30} size="120px">
  <CircularProgressIndicator />
</CircularProgress>`;

const thickness = `<CircularProgress value={59} size="100px" thickness="4px">
  <CircularProgressIndicator />
</CircularProgress>`;

const withRoundCaps = `<CircularProgress value={80}>
  <CircularProgressIndicator withRoundCaps />
</CircularProgress>`;

const withLabel = `<CircularProgress value={40}>
  <CircularProgressIndicator color="$success9" />
  <CircularProgressLabel />
</CircularProgress>`;

const indeterminate = `<CircularProgress indeterminate>
  <CircularProgressIndicator color="$success9" />
</CircularProgress>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    CircularProgress: {
      baseStyle: {
        root: SystemStyleObject,
        track: SystemStyleObject,
        indicator: SystemStyleObject,
        label: SystemStyleObject
      },
      defaultProps: {
        root: ThemeableCircularProgressOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  color,
  size,
  thickness,
  withRoundCaps,
  withLabel,
  indeterminate,
  theming,
};
