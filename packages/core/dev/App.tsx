import { Grid } from "../src";

export default function App() {
  return (
    <>
      <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
        <Grid.Item rowSpan={2} colSpan={1} bg="royalblue" />
        <Grid.Item colSpan={2} bg="lightskyblue" />
        <Grid.Item colSpan={2} bg="lightskyblue" />
        <Grid.Item colSpan={4} bg="royalblue" />
      </Grid>
    </>
  );
}
