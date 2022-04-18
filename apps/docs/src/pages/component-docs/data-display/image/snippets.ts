const importComponent = `import { Image } from "@hope-ui/design-system"`;

const basicUsage = `<Image 
  boxSize="$sm" 
  src="https://bit.ly/3pq0AcS" 
  alt="Monkey D. Luffy" 
  objectFit="cover"
/>`;

const size = `<HStack alignItems="flex-start" spacing="$4">
  <Image
    boxSize="100px"
    src="https://bit.ly/3pq0AcS"
    alt="Monkey D. Luffy"
    objectFit="cover"
  />
  <Image
    boxSize="150px"
    src="https://bit.ly/3pq0AcS"
    alt="Monkey D. Luffy"
    objectFit="cover"
  />
  <Image
    boxSize="200px"
    src="https://bit.ly/3pq0AcS"
    alt="Monkey D. Luffy"
    objectFit="cover"
  />
</HStack>`;

const borderRadius = `<Image
  boxSize="150px"
  borderRadius="$full"
  src="https://bit.ly/3pq0AcS"
  alt="Monkey D. Luffy"
  objectFit="cover"
/>`;

const fallbackSupport = `<Image src="gibberish.png" fallbackSrc="https://via.placeholder.com/150" />`;

export const snippets = {
  importComponent,
  basicUsage,
  size,
  borderRadius,
  fallbackSupport,
};
