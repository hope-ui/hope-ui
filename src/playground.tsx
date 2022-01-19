import { render } from "solid-js/web";

import { Box, Center, HopeProvider } from ".";

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
      <Center boxSize="200px" bg="$primary500">
        <Box
          as="button"
          borderRadius="$md"
          bg="tomato"
          color="white"
          px="$4"
          h="$8"
          css={{
            [`${Center} &`]: {
              background: "red",
            },
          }}
        >
          Button
        </Box>
      </Center>
      <Box
        as="button"
        borderRadius="$md"
        bg="tomato"
        color="white"
        px="$4"
        h="$8"
        css={{
          [`${Center} &`]: {
            bg: "green",
          },
        }}
      >
        Button
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
