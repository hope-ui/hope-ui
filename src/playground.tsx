import { render } from "solid-js/web";

import { Box, HopeProvider } from ".";

function App() {
  const property = {
    imageUrl: "https://bit.ly/2Z4KKcF",
    imageAlt: "Rear view of modern home with pool",
    beds: 3,
    baths: 2,
    title: "Modern home in city center in the heart of historic Los Angeles",
    formattedPrice: "$1,900.00",
    reviewCount: 34,
    rating: 4,
  };

  return (
    <HopeProvider>
      <Box
        maxW="$sm"
        borderRadius="$lg"
        borderStyle="solid"
        borderWidth="1px"
        borderColor="$neutral300"
        overflow="hidden"
      >
        <img src={property.imageUrl} alt={property.imageAlt} />

        <Box p="$6">
          <Box display="flex" alignItems="baseline">
            <Box
              color="$neutral500"
              fontWeight="$semibold"
              letterSpacing="$wide"
              fontSize="$xs"
              textTransform="uppercase"
            >
              {property.beds} beds &bull; {property.baths} baths
            </Box>
          </Box>

          <Box mt="$1" fontWeight="$semibold" as="h4" lineHeight="$tight" lineClamp={1}>
            {property.title}
          </Box>

          <Box>
            {property.formattedPrice}
            <Box as="span" color="$neutral600" fontSize="$sm">
              / wk
            </Box>
          </Box>

          <Box display="flex" mt="$2" alignItems="center">
            <Box as="span" color="$neutral600" fontSize="$sm">
              {property.reviewCount} reviews
            </Box>
          </Box>
        </Box>
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
