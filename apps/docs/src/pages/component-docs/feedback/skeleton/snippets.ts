const importComponent = `import { Skeleton, SkeletonCircle, SkeletonText } from "@hope-ui/design-system"`;

const basicUsageStandalone = `<VStack alignItems="stretch" spacing="$2">
  <Skeleton height="20px" />
  <Skeleton height="20px" />
  <Skeleton height="20px" />
</VStack>`;

const basicUsageWrapper = `<Skeleton>
  <div>contents wrapped</div>
  <div>won't be visible</div>
</Skeleton>`;

const circleAndText = `<Box p="$6" boxShadow="$lg" rounded="$sm" bg="$loContrast">
  <SkeletonCircle size="$10" />
  <SkeletonText mt="$4" noOfLines={4} spacing="$4" />
</Box>`;

const color = `<Skeleton startColor="tomato" endColor="orange" height="20px" />`;

const skipping = `<Skeleton loaded>
  <span>Hope UI is cool</span>
</Skeleton>`;

export const snippets = {
  importComponent,
  basicUsageStandalone,
  basicUsageWrapper,
  circleAndText,
  color,
  skipping,
};
