const importComponent = `import { Box } from "@hope-ui/solid"`;

const basicUsage = `<Box bg="tomato" w="100%" p="$4" color="white">
  This is the Box
</Box>`;

const complexeExample = `// Sample card from Airbnb

function AirbnbExample() {
  const property = {
    imageUrl: "https://bit.ly/2Z4KKcF",
    imageAlt: "Rear view of modern home with pool",
    beds: 3,
    baths: 2,
    title: "Modern home in city center in the heart of historic Los Angeles",
    formattedPrice: "$1,900.00",
    reviewCount: 34,
    rating: 4,
  }

  return (
    <Box
      maxW="$sm"
      borderWidth="1px"
      borderColor="$neutral6"
      borderRadius="$lg"
      overflow="hidden"
    >
      <Box as="img" src={property.imageUrl} alt={property.imageAlt} />
      <Box p="$6">
        <Box display="flex" alignItems="baseline">
          <Badge px="$2" colorScheme="primary" rounded="$full">
            New
          </Badge>
          <Box
            color="$neutral9"
            fontWeight="$bold"
            letterSpacing="$wide"
            fontSize="$xs"
            textTransform="uppercase"
            ml="$2"
          >
            {property.beds} beds &bull; {property.baths} baths
          </Box>
        </Box>

        <Box mt="$1" fontWeight="$semibold" as="h4" lineHeight="$tight" noOfLines={1}>
          {property.title}
        </Box>

        <Box>
          {property.formattedPrice}
          <Box as="span" color="$neutral11" fontSize="$sm">
            / wk
          </Box>
        </Box>

        <Box display="flex" mt="$2" alignItems="center">
          <For each={Array(5).fill("")}>
            {(_, i) => <IconStar color={i() < property.rating ? "$warning9" : "$neutral3"} />}
          </For>
          <Box as="span" ml="$2" color="$neutral11" fontSize="$sm">
            {property.reviewCount} reviews
          </Box>
        </Box>
      </Box>
    </Box>
  )
}`;

const asProp = `<Box as="button" borderRadius="$md" bg="tomato" color="white" px="$4" h="$8">
  Button
</Box>`;

export const snippets = {
  importComponent,
  basicUsage,
  complexeExample,
  asProp,
};
