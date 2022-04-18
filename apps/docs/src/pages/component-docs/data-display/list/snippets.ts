const importComponent = `import { 
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from "@hope-ui/design-system"`;

const unorderedList = `<UnorderedList>
  <ListItem>Clone or download repository from GitHub</ListItem>
  <ListItem>Install dependencies with npm</ListItem>
  <ListItem>To start development server run npm start command</ListItem>
  <ListItem>Run tests to make sure your changes do not break the build</ListItem>
  <ListItem>Submit a pull request once you are done</ListItem>
</UnorderedList>`;

const orderedList = `<OrderedList>
  <ListItem>Clone or download repository from GitHub</ListItem>
  <ListItem>Install dependencies with npm</ListItem>
  <ListItem>To start development server run npm start command</ListItem>
  <ListItem>Run tests to make sure your changes do not break the build</ListItem>
  <ListItem>Submit a pull request once you are done</ListItem>
</OrderedList>`;

const unstyledListWithIcon = `<List spacing="$3">
  <ListItem>
    <ListIcon as={IconCheck} color="$success9" />
    Clone or download repository from GitHub
  </ListItem>
  <ListItem>
    <ListIcon as={IconCheck} color="$success9" />
    Install dependencies with npm
  </ListItem>
  <ListItem>
    <ListIcon as={IconCheck} color="$success9" />
    To start development server run npm start command
  </ListItem>
  <ListItem>
    <ListIcon as={IconCheck} color="$success9" />
    Run tests to make sure your changes do not break the build
  </ListItem>
  <ListItem>
    <ListIcon as={IconCircleDashed} color="$info9" />
    Submit a pull request once you are done
  </ListItem>
</List>`;

export const snippets = {
  importComponent,
  unorderedList,
  orderedList,
  unstyledListWithIcon,
};
