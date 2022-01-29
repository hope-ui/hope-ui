import "./playground.css";

import { render } from "solid-js/web";

import { Box, Center, Grid, GridItem, HopeProvider } from ".";

export function App() {
  return (
    <HopeProvider>
      <Box bg="white" borderRadius="md" boxShadow="md" w="full" maxW="sm" p="4" mx="auto">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero sed, error necessitatibus
        architecto ipsam rem non alias quod. Qui rem reprehenderit expedita veritatis laborum,
        rerum, hic pariatur quibusdam iure ipsa fugit dolor delectus nesciunt. Eos illo ad iure
        beatae magnam praesentium, sapiente modi repellendus ipsam molestiae natus ducimus. Velit
        sunt animi atque. Totam, illo! Suscipit aut repellendus tempore, omnis veniam cupiditate
        provident tenetur, aperiam sapiente minima eaque nesciunt. Inventore animi obcaecati qui
        neque veniam aperiam dolor quas quidem fuga. Corporis quae dolore quas similique delectus
        esse ipsam maiores aliquid natus veritatis est officiis, maxime eius fugit illum voluptate
        tempore quos.
      </Box>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
