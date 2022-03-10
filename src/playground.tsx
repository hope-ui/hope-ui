import "./playground.css";

import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";

import {
  Alert,
  Box,
  Button,
  Tooltip,
  CloseButton,
  createDisclosure,
  Divider,
  Drawer,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Select,
  useColorMode,
  VStack,
} from ".";
import { IconCloseSmall } from "./components/icons/IconCloseSmall";

const fruits = [
  "Apple",
  "Banana",
  "Blueberry",
  "Boysenberry",
  "Cherry",
  "Cranberry",
  "Durian",
  "Eggplant",
  "Fig",
  "Grape",
  "Guava",
  "Huckleberry",
];

interface Fruit {
  identifier: number;
  name: string;
  disabled: boolean;
}

const fruitsObject: Fruit[] = [
  { identifier: 1, name: "Apple", disabled: true },
  { identifier: 2, name: "Banana", disabled: false },
  { identifier: 3, name: "Blueberry", disabled: true },
  { identifier: 4, name: "Boysenberry", disabled: false },
  { identifier: 5, name: "Cherry", disabled: false },
  { identifier: 6, name: "Cranberry", disabled: false },
  { identifier: 7, name: "Durian", disabled: true },
  { identifier: 8, name: "Eggplant", disabled: true },
  { identifier: 9, name: "Fig", disabled: false },
  { identifier: 10, name: "Grape", disabled: false },
  { identifier: 11, name: "Guava", disabled: false },
  { identifier: 12, name: "Huckleberry", disabled: true },
];

export function App() {
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = createSignal<string | null>("Cherry");
  const [selectedObject, setSelectedObject] = createSignal<Fruit>({ identifier: 5, name: "Cherry", disabled: false });

  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <Box p="$4">
      <Box p="$4">
        <Tooltip withArrow label="Search places" bg="$neutral4" color="black">
          <span>Hover me</span>
        </Tooltip>
      </Box>
      <Button onClick={onOpen}>Open Drawer</Button>
      <Drawer placement="right" onClose={onClose} opened={isOpen()}>
        <Drawer.Overlay />
        <Drawer.Panel>
          <Drawer.Header borderBottomWidth="1px">Basic Drawer</Drawer.Header>
          <Drawer.Body>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer.Body>
        </Drawer.Panel>
      </Drawer>
      <Alert status="danger">
        <Alert.Icon />
        <Alert.Title mr="$2">Your browser is outdated!</Alert.Title>
        <Alert.Description>Your Chakra experience may be degraded.</Alert.Description>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
      <Tooltip label="I am open by default" placement="left" defaultOpened withArrow>
        <Button>Open on startup</Button>
      </Tooltip>
      <HStack spacing="$5">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <VStack spacing="$5" flexGrow={1}>
          <p>Controlled</p>
          <Select value={selected()} onChange={setSelected}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value>{selected()?.toUpperCase()}</Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Box px="$4" py="$2">
                Header
              </Box>
              <Divider />
              <Select.Listbox>
                <For each={fruits}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit === "Durian"}>
                      <Select.OptionText>{fruit}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
              <Divider />
              <Box px="$4" py="$2">
                Footer
              </Box>
            </Select.Panel>
          </Select>
          <Select value={selected()} onChange={setSelected}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Box px="$4" py="$2">
                Header
              </Box>
              <Divider />
              <Select.Listbox>
                <For each={fruits}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit === "Durian"}>
                      <Select.OptionText>{fruit}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
              <Divider />
              <Box px="$4" py="$2">
                Footer
              </Box>
            </Select.Panel>
          </Select>
          <Select value={selectedObject()} onChange={setSelectedObject} compareKey="identifier">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value>
                {selectedObject()?.identifier} - {selectedObject()?.name}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruitsObject}>
                  {fruit => (
                    <Select.Option value={fruit} textValue={fruit.name} disabled={fruit.disabled}>
                      <Select.OptionText>{fruit.name}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Uncontrolled</p>
          <Select defaultValue="Fig" defaultTextValue="Fig">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruits}>
                  {fruit => (
                    <Select.Option value={fruit} disabled={fruit === "Durian"}>
                      <Select.OptionText>{fruit}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
          </Select>
          <Select defaultValue="luffy" defaultTextValue="Monkey D. Luffy">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a framework</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <Select.Option value="luffy">
                  <Select.OptionText>Monkey D. Luffy</Select.OptionText>
                  <Select.OptionIndicator />
                </Select.Option>
                <Select.Option value="zoro">
                  <Select.OptionText>Roronoa Zoro</Select.OptionText>
                  <Select.OptionIndicator />
                </Select.Option>
              </Select.Listbox>
            </Select.Panel>
          </Select>
          <Select
            defaultValue={{ identifier: 5, name: "Cherry", disabled: false }}
            defaultTextValue="Cherry"
            compareKey="identifier"
          >
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <For each={fruitsObject}>
                  {fruit => (
                    <Select.Option value={fruit} textValue={fruit.name} disabled={fruit.disabled}>
                      <Select.OptionText>{fruit.name}</Select.OptionText>
                      <Select.OptionIndicator />
                    </Select.Option>
                  )}
                </For>
              </Select.Listbox>
            </Select.Panel>
          </Select>
        </VStack>
        <VStack spacing="$5" flexGrow={1}>
          <p>Group</p>
          <Select>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a food</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Panel>
              <Select.Listbox>
                <Select.OptGroup>
                  <Select.Label>Fruits</Select.Label>
                  <For each={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}>
                    {item => (
                      <Select.Option value={item}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
                <Select.OptGroup>
                  <Select.Label>Vegetables</Select.Label>
                  <For each={["Aubergine", "Broccoli", "Carrot", "Courgette", "Leek"]}>
                    {item => (
                      <Select.Option value={item} disabled={item === "Carrot"}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
                <Select.OptGroup>
                  <Select.Label>Meat</Select.Label>
                  <For each={["Beef", "Chicken", "Lamb", "Pork", "Salmon"]}>
                    {item => (
                      <Select.Option value={item}>
                        <Select.OptionText>{item}</Select.OptionText>
                        <Select.OptionIndicator />
                      </Select.Option>
                    )}
                  </For>
                </Select.OptGroup>
              </Select.Listbox>
            </Select.Panel>
          </Select>
        </VStack>
      </HStack>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non, atque autem? Tempore aliquam soluta deserunt?
        Aliquid tenetur tempora dolorem hic optio corrupti veniam rem officiis repellendus, quibusdam ipsam laborum,
        quia eum, quas consectetur harum ducimus iusto deserunt a modi voluptates laudantium saepe eaque cupiditate.
        Asperiores, quaerat. Quos quibusdam harum placeat adipisci, architecto iure neque odit molestiae modi
        voluptatibus maiores maxime officia aperiam nam eum, incidunt dolorum, vero dolor eligendi laborum tempora?
        Architecto possimus officia obcaecati velit earum. Aut iusto officiis odit. Tenetur minima vel molestias, quia
        explicabo voluptatum facilis dolor nostrum impedit quisquam labore illo. Consequatur exercitationem corporis
        excepturi, quidem accusantium quia doloremque, quaerat, illo similique fuga perspiciatis in impedit a
        repellendus repellat consequuntur adipisci. Assumenda iusto quisquam sit labore numquam ad quasi unde beatae
        consequuntur blanditiis veniam non, voluptatem soluta dignissimos itaque tempore consequatur quod voluptate
        eaque commodi officia quo velit impedit officiis. Dolores tempora perferendis dolor hic fugiat officia veritatis
        commodi id aut maxime, ad sint quia nostrum soluta quod impedit similique nam laborum reiciendis voluptatibus
        tenetur, ab quae est vel. Fugiat, non cupiditate. Fugiat quaerat corrupti tempora id, error exercitationem rem
        similique sit omnis laborum. Repudiandae vitae mollitia officia blanditiis. Iste quod praesentium sequi quidem,
        distinctio exercitationem incidunt sapiente necessitatibus deserunt ducimus voluptates dolor asperiores quis
        unde totam non temporibus explicabo autem impedit. Ad accusamus quibusdam voluptates praesentium omnis voluptate
        aut necessitatibus, doloribus, nulla, id voluptatem harum aliquid unde et? Voluptatibus tempora placeat
        excepturi nam molestiae ab sunt quidem! Illo ut aut tenetur ullam voluptas. Laudantium eaque adipisci rerum ad
        eveniet, tempora dolores dolor ipsum esse sapiente alias repudiandae repellendus temporibus nisi voluptatum ea
        atque nemo fugit magnam modi. Ex, quos ipsam nobis assumenda ea exercitationem dolorum dolore quas consequuntur,
        ab quibusdam itaque, eum dolorem asperiores laudantium molestiae est harum quam totam illum! Blanditiis est
        repudiandae rerum dolores eveniet fuga exercitationem veniam aliquid quidem quod dolorum sequi provident
        molestiae, voluptatum delectus eos iure incidunt. Vero, eius possimus, necessitatibus qui recusandae sit tempore
        dolorem quis veritatis excepturi rem quas ex pariatur voluptate fugit ducimus deserunt. Cupiditate omnis
        temporibus architecto consectetur ducimus necessitatibus totam iusto, aperiam mollitia cum autem excepturi eius
        quaerat pariatur iste animi dicta? Molestiae, facere. Labore magnam quo dignissimos iste, quisquam consequuntur
        id molestiae maiores pariatur obcaecati voluptatibus expedita. Nihil molestiae quis numquam in sunt blanditiis
        aliquam id totam sint minus, commodi incidunt explicabo velit consectetur ut unde ex mollitia tempora! Ad
        accusamus doloribus autem nisi architecto sunt fugit? Optio magni iusto esse dignissimos odit velit aspernatur
        cupiditate harum, voluptatum fugiat error repudiandae nobis labore rerum quae facilis vitae autem numquam
        expedita ea fugit possimus! Rem perferendis omnis autem corrupti voluptates sint expedita facilis. Velit, quia.
        Amet quis quaerat esse voluptate eligendi, obcaecati consequuntur nulla omnis nobis quidem inventore sequi
        consequatur, voluptatum doloremque deserunt blanditiis dignissimos sed explicabo, est nemo necessitatibus
        voluptates. Molestiae dicta quo fugit odio dolore dolorem optio, nemo maiores perspiciatis eius? Nesciunt, cum
        odio voluptas libero, facilis nihil vel ducimus inventore ipsam doloribus dolorum corporis ad, atque iure
        voluptate enim eligendi ex totam eos omnis consectetur praesentium! Veniam impedit dolore voluptas iste
        accusantium numquam qui sit nisi, omnis nostrum assumenda repellendus nam dolores ratione beatae, enim mollitia
        harum officiis, nemo quae ullam minus at tenetur earum. Porro reprehenderit cum molestiae harum soluta incidunt
        mollitia quod ex ipsa at nam accusantium voluptates ab aperiam odit non nesciunt sit nobis blanditiis, veniam
        vero. Distinctio mollitia accusamus nulla consequuntur debitis minima reprehenderit temporibus nam, laboriosam
        fugiat facere harum non officia eaque iste quis, totam aperiam quia eligendi corporis. Facilis reiciendis sed
        minima voluptate mollitia error aliquam? Aliquid veritatis cumque facere sed ea, voluptatum facilis atque dicta
        libero odit, alias a consectetur magnam possimus impedit id inventore eos quod delectus. Laudantium a maiores
        suscipit sed nam, sunt, atque officiis dolor inventore praesentium culpa. Sunt corrupti aut nisi unde provident
        quis voluptatum quisquam rem quia rerum velit maiores sapiente, ratione mollitia ducimus, culpa ex libero illum
        accusamus incidunt. Velit nesciunt modi doloribus, suscipit cumque corrupti commodi, inventore optio asperiores
        voluptas aliquid placeat! Modi vero tempora quis dolorem facere ratione minima quod. Nesciunt facilis veniam
        fugit, quasi blanditiis maxime sequi corrupti sunt iure illo repudiandae provident consequuntur mollitia dicta
        rem! Impedit, labore corporis maiores eligendi error consectetur, esse enim earum repellendus corrupti totam
        atque possimus! Autem molestiae fugit tempore praesentium laborum, commodi voluptatibus eius sit facilis ullam
        odio ex modi veniam dolorum repudiandae tempora officiis accusamus tenetur nisi nostrum? Maiores repellat
        doloribus necessitatibus enim, perferendis, ducimus provident illo, repellendus expedita itaque porro. Nemo
        consequuntur omnis incidunt, laboriosam illo vero recusandae nostrum facilis quia corrupti nesciunt,
        voluptatibus natus velit, nulla quae nobis nisi laborum sed exercitationem dolores adipisci ad molestiae.
        Similique consectetur voluptates veritatis culpa necessitatibus alias. Repellat vero, eum placeat ipsum animi
        est fuga! Nobis mollitia distinctio maxime sed deserunt libero necessitatibus ad, deleniti quaerat saepe.
        Dolores quae aperiam dolore quod delectus perferendis sint tenetur atque. Voluptatem ad omnis voluptates esse
        reprehenderit saepe, perferendis quae, animi sequi laboriosam accusantium eius accusamus obcaecati distinctio
        amet tempora ratione culpa fugit quidem autem incidunt a ipsam! Corporis possimus earum odit cumque labore est,
        ullam nemo. Velit nisi odit, itaque doloribus voluptatem similique fuga, distinctio explicabo praesentium totam,
        et accusantium officia fugit expedita eum! Facilis temporibus voluptates eligendi ipsam earum provident
        perferendis nulla sint nisi, voluptate voluptatum dolorem, aliquam necessitatibus fugiat quisquam accusantium
        sed sunt dolores optio dolorum sapiente. Facilis, magnam fugit alias repellat dolores reprehenderit corrupti
        quia magni, illum excepturi officia quo maiores perspiciatis, ad voluptatum impedit molestias blanditiis atque
        optio? Animi quo voluptatibus eius reiciendis quaerat ad impedit voluptatem aliquam. Magnam quos recusandae
        incidunt amet natus nesciunt iure quod quae illum debitis quidem, consequatur eum accusamus ab quo voluptatibus?
        Accusamus, expedita eos impedit quisquam neque ratione dolorum autem facilis voluptate officiis. Quaerat
        distinctio nesciunt tempore repellendus tenetur, voluptate reiciendis, explicabo nam adipisci nihil minima quas
        officiis ipsum quidem odio cum hic recusandae aspernatur impedit saepe, inventore magnam sunt. Placeat
        perferendis animi fugit, dolorum debitis nobis ab voluptate tempora pariatur ullam corrupti a alias dignissimos,
        eum architecto optio beatae facilis totam saepe.
      </p>
    </Box>
  );
}

const config: HopeThemeConfig = {
  components: {},
};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
