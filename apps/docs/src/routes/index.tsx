/*

import { Title } from "solid-start";

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>
    </main>
  );
}
*/
import { AspectRatio, Button, hope, HStack } from "@hope-ui/core";
import { For, onMount } from "solid-js";
import { Title } from "solid-start";

const range = [...Array(3000).keys()];

function Card() {
  return (
    <hope.div
      sx={{
        border: "1px solid",
        borderColor: "background.surface2",
        alignSelf: "center",
        maxWidth: "100%",
        minWidth: { xs: 220, sm: 360 },
        boxShadow: "sm",
        borderRadius: "md",
        overflow: "auto",
      }}
    >
      <hope.div
        sx={{
          borderWidth: "0 0 1px 0",
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "background.surface2",
        }}
      >
        <hope.h2 fontSize="base">Photo upload</hope.h2>
      </hope.div>
      <hope.div sx={{ p: 2 }}>
        <hope.div
          sx={{
            borderRadius: "md",
            overflow: "auto",
            borderColor: "background.surface2",
            bgColor: "background.surface1",
          }}
        >
          <AspectRatio>
            <img alt="" src="https://mui.com/static/images/cards/yosemite.jpeg" />
          </AspectRatio>
          <hope.div
            sx={{
              display: "flex",
              p: 1.5,
              gap: 1.5,
              "& > button": { bgColor: "background.body" },
            }}
          ></hope.div>
        </hope.div>
      </hope.div>
      <hope.div
        sx={{
          display: "flex",
          p: 2,
          borderTop: "1px solid",
          borderColor: "background.surface2",
          gap: 1,
        }}
      >
        <Button size="md" variant="plain" sx={{ ml: "auto" }}>
          Replace photo
        </Button>
        <Button size="md">Upload</Button>
      </hope.div>
    </hope.div>
  );
}

export default function Home() {
  const startTime = new Date().getTime();

  onMount(() => {
    const endTime = new Date().getTime();
    console.log(endTime - startTime);
  });

  return (
    <main>
      <Title>Hello World</Title>
      <HStack spacing={4} wrap="wrap" p="4">
        <For each={range}>{(_, i) => <Button>Button</Button>}</For>
      </HStack>
    </main>
  );
}
