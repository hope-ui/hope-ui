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
        <Drawer.Content>
          <Drawer.Header borderBottomWidth="1px">Basic Drawer</Drawer.Header>
          <Drawer.Body>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Drawer.Body>
        </Drawer.Content>
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
            <Select.Content>
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
            </Select.Content>
          </Select>
          <Select value={selected()} onChange={setSelected}>
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Content>
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
            </Select.Content>
          </Select>
          <Select value={selectedObject()} onChange={setSelectedObject} compareKey="identifier">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a fruit</Select.Placeholder>
              <Select.Value>
                {selectedObject()?.identifier} - {selectedObject()?.name}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Content>
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
            </Select.Content>
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
            <Select.Content>
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
            </Select.Content>
          </Select>
          <Select defaultValue="luffy" defaultTextValue="Monkey D. Luffy">
            <Select.Trigger maxW="300px">
              <Select.Placeholder>Choose a framework</Select.Placeholder>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Content>
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
            </Select.Content>
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
            <Select.Content>
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
            </Select.Content>
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
            <Select.Content>
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
            </Select.Content>
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
      <Tooltip label="I am always open" placement="top" opened>
        <Button>Always Open</Button>
      </Tooltip>

      <Tooltip label="I am open by default" placement="left" defaultOpened>
        <Button>Open on startup</Button>
      </Tooltip>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, commodi magni reprehenderit corrupti optio
        sed officia ullam incidunt voluptates! Excepturi et quis sed delectus vitae voluptate numquam itaque odio velit
        autem eaque illum vel harum sunt, corrupti natus temporibus quia culpa mollitia at modi consequuntur, magnam
        est? Soluta, repudiandae. Sequi culpa illo voluptatum modi aperiam consectetur dignissimos minima temporibus
        dolorum iusto porro ipsum vero odio quae similique, atque fuga perferendis ipsam adipisci, commodi minus
        doloremque. Atque eligendi velit eum omnis enim. Odio earum quisquam voluptatum, harum natus porro nemo
        aspernatur dolorum sapiente corporis modi nulla totam eius in quae iste facilis doloremque illo officia at?
        Unde, iure? Ab pariatur iusto consequatur aliquam, iure, repellendus neque iste obcaecati at, odio illo.
        Repellendus, laudantium. Atque quia placeat id sequi illo modi mollitia odit optio libero, cum delectus. Aut
        nihil dolore architecto rem blanditiis veritatis debitis doloremque incidunt quo alias modi in similique aperiam
        nemo reiciendis dolores, officia reprehenderit, accusamus magni sed aliquam, recusandae sapiente suscipit. Magni
        facere tenetur perferendis sit! Qui vitae necessitatibus nam officiis? Nulla porro possimus culpa iure nam
        sapiente quae numquam ipsam sit excepturi eligendi quaerat autem tenetur dolorem atque eaque quo perferendis
        esse voluptatem, soluta consequatur voluptas cupiditate dolorum? Perspiciatis quam porro aspernatur provident
        placeat minima sunt error voluptatum, dolorum ut illum alias soluta dolorem odio adipisci molestiae maiores
        corrupti repellat at odit ipsam? Nam eos non tempore earum aliquid iste dignissimos dolorum molestiae veritatis
        atque suscipit voluptas repudiandae, ex in harum est labore excepturi impedit ducimus id. Mollitia ipsam
        accusamus recusandae. Inventore doloribus laudantium optio impedit eveniet, perferendis excepturi dolorum a modi
        nesciunt quam asperiores at exercitationem minus harum, facere enim est! Illum voluptate temporibus iste,
        quisquam vel, fuga nostrum, accusamus quidem ipsam velit hic fugiat assumenda impedit dolores neque. Cum aliquam
        minus magnam minima quisquam rerum fuga sapiente corrupti exercitationem dolorem sit beatae reiciendis quam
        cupiditate id quod vel aperiam, molestias asperiores sequi! Numquam voluptatem, fugit esse minus, autem ea, fuga
        dolor distinctio libero pariatur assumenda dicta tempora ut quo recusandae nobis voluptates illo suscipit
        architecto aliquam. Totam velit ex quidem asperiores ipsum ullam, impedit itaque eum nemo, architecto fugit
        officia maxime, consequuntur iusto perferendis nobis molestiae mollitia exercitationem. Magnam, cum dolorum. At
        vitae deleniti amet ea, aliquam doloribus impedit vero aperiam exercitationem. Porro illo iste blanditiis minima
        ipsam veritatis necessitatibus sunt consequatur, quisquam doloremque inventore corrupti officiis cupiditate
        incidunt aliquam iure? Voluptatibus, itaque aliquid fugit laborum in a ratione ut, labore omnis alias deserunt
        exercitationem amet dicta animi non delectus molestias ad incidunt ipsa beatae qui iure totam accusantium?
        Voluptatem, dolores. Tempora at vitae corporis, enim voluptate id porro quidem sunt accusamus expedita incidunt
        adipisci facilis fugit dicta perferendis? Porro aliquam, corporis consequuntur reiciendis facilis dicta est
        rerum minus beatae minima ab labore quibusdam fugit, possimus temporibus earum, recusandae fugiat odio et alias
        error. Culpa quidem atque, iusto recusandae perferendis ipsa odit doloribus officiis quam, aliquam alias. Quas
        ut amet accusantium inventore. Tenetur ea unde eum, totam cum maxime error? Aperiam minus dolorum beatae modi
        saepe mollitia voluptatum quidem quod eligendi vero, voluptatem voluptatibus commodi magnam alias neque et
        voluptates doloribus unde incidunt sequi. Earum, quia, quod dolor, iure doloremque asperiores officia beatae
        deserunt alias omnis id rem officiis praesentium quam! Sint quas deserunt possimus atque magni ipsa, nisi soluta
        natus iste autem consequatur, nobis eum voluptate. Quod dolores corporis ipsum aliquid voluptates ad commodi,
        accusantium consequatur quidem nostrum, doloribus possimus incidunt qui ea porro magnam nesciunt aut soluta
        adipisci temporibus cupiditate laboriosam, officia explicabo. Laboriosam reprehenderit soluta rem, consequatur
        excepturi dolores eligendi nostrum laudantium in impedit optio omnis nam aperiam quis nisi ratione dignissimos
        dolore incidunt. Enim harum rem exercitationem obcaecati ducimus fugit nesciunt hic deserunt doloribus aut?
        Aperiam unde porro nemo nobis tenetur doloremque voluptatum? Excepturi enim eos repudiandae, officiis beatae
        veniam omnis voluptatem accusantium expedita laborum laboriosam corporis? Accusantium, similique quod fuga saepe
        minus odio, et suscipit quidem provident deserunt aspernatur! Id, consequatur. Dolorum ut ipsa ea, aperiam
        expedita numquam tempore obcaecati consectetur accusantium dicta, fugit nam asperiores quisquam quia qui neque
        inventore maiores! Quibusdam molestiae iure, distinctio animi tempore nisi quasi. Illo quia necessitatibus
        assumenda laudantium animi saepe nihil omnis reiciendis nam ullam vel repudiandae illum odit, quam magni maiores
        laboriosam totam culpa, perspiciatis natus voluptates libero error aliquam. Perferendis, cum voluptatem dolorem
        id assumenda eveniet, dignissimos velit illum expedita sunt recusandae ipsum ipsam omnis error adipisci sint
        vitae maxime hic alias ullam unde quam. Ut illum ratione expedita sapiente voluptates? Dignissimos ipsam dicta
        reprehenderit a fuga harum repellat ullam rem quis, quae voluptatibus doloribus ratione sed? Ratione dolore
        temporibus nemo distinctio neque, eligendi labore corrupti impedit veritatis iste esse sint earum laudantium est
        obcaecati asperiores veniam! Est dolor temporibus molestiae optio mollitia dolore, natus nemo, corporis quam
        sed, debitis veritatis? Quidem molestiae voluptates sapiente beatae laborum, distinctio ipsam. Ipsum saepe
        officia possimus, maxime, dicta quasi assumenda nulla cupiditate laboriosam dolor ducimus iste voluptatum magni
        blanditiis corrupti ipsam omnis eligendi. Accusamus tenetur velit reiciendis facere sapiente beatae tempora,
        voluptatem mollitia molestias reprehenderit tempore molestiae ut, sequi, obcaecati quia ipsam? Dolores dolor,
        magni reiciendis saepe reprehenderit nihil fugiat maxime perferendis, nam quisquam aspernatur velit labore
        pariatur necessitatibus sapiente sint odit a et autem possimus. Minus maiores maxime possimus odit perferendis a
        repudiandae asperiores quae quo fugiat ipsam fugit ex suscipit cumque cupiditate, quidem quis eveniet voluptates
        sapiente assumenda. Placeat aliquid assumenda modi voluptatibus! Dolorum numquam nemo veritatis ut voluptatibus
        ullam sequi exercitationem quasi alias accusamus, necessitatibus blanditiis repellat perspiciatis dolore
        inventore tenetur fugiat soluta ipsa facere repellendus adipisci perferendis non! Optio sed enim maxime velit
        quibusdam eligendi assumenda suscipit quia quaerat nihil illum quod dolorem autem ipsam vero, sapiente placeat
        amet! Impedit cupiditate quisquam iure omnis cum laboriosam accusantium tempore quae. Sapiente animi hic
        molestiae doloremque similique praesentium dolore deserunt, libero architecto, facere eligendi voluptate ab
        repellendus nulla qui! Magni eligendi unde assumenda corporis similique voluptatem quos deleniti rem aperiam
        debitis cupiditate impedit optio praesentium iure veniam molestiae, enim ea temporibus quod possimus dolores
        aliquam, cumque itaque. Nostrum facere consectetur perferendis aspernatur. Quisquam illo dolorum iure magni
        beatae illum consequatur? Odit dolore possimus architecto iure maiores, vero deleniti, inventore nemo libero
        facilis perspiciatis earum, velit nisi? In numquam hic laudantium deleniti autem sapiente commodi neque, dolore
        quis ea libero perspiciatis earum quasi consectetur, aspernatur ad. Ducimus omnis dolores mollitia impedit in
        nesciunt distinctio cum sunt repellat quasi voluptates repudiandae, facilis fugit nobis rerum tenetur quisquam
        ut vero corrupti. Voluptate fugit minima impedit doloribus alias ab aliquid asperiores officia voluptatum
        obcaecati omnis dolores iste, corporis mollitia dignissimos pariatur placeat dolore eaque, tenetur commodi
        magni. Excepturi, eveniet. Architecto eveniet aliquam omnis, ea quidem sunt labore. Saepe adipisci esse eum
        fuga, earum eius dignissimos voluptatibus vero est veritatis neque provident excepturi, quam temporibus iusto
        rem similique nisi. Quis officiis laborum nemo tempora vitae, tenetur, assumenda reiciendis quam fugiat saepe
        eius repudiandae delectus enim alias quaerat qui quia maxime facere eaque repellat rem. Veritatis, numquam
        incidunt non vel officiis in totam laudantium minus quo, recusandae labore ut ea, ducimus doloremque? Totam
        nobis debitis quia aliquam quis dignissimos ducimus sunt, aut, excepturi voluptates non quisquam suscipit,
        eligendi voluptatem repellat. Modi obcaecati, fugit, neque dignissimos aspernatur harum eos, est sint quas
        officia error deleniti vel rerum ullam vero necessitatibus eaque nemo ab perferendis! Quia impedit, odit
        officiis omnis facilis quas nobis? Ducimus ut vitae sapiente unde rem consectetur molestias optio inventore sit
        nemo, sint consequuntur temporibus eos magnam necessitatibus magni aperiam repellat aspernatur dolores, numquam
        doloremque labore. Neque architecto fuga laboriosam minus libero quos aperiam, labore totam porro soluta fugiat
        iusto nulla quam consectetur placeat obcaecati molestias ipsa officiis sint nobis vel esse, odio ullam. A
        perspiciatis, obcaecati quasi facere aut laborum, ex modi, consequuntur nihil neque quia. Laborum quis magni
        unde architecto facilis, quasi dignissimos voluptate ex nobis earum atque totam mollitia incidunt eius eligendi
        molestias optio velit deserunt consequatur odio illum fugiat repellendus sequi. Possimus ipsa laboriosam at
        ratione maxime omnis, dolor ut repudiandae consectetur fuga fugiat autem cumque nisi delectus maiores facilis
        distinctio, ea alias, neque corrupti sapiente corporis? Totam voluptatem aliquid esse officia sequi aspernatur
        corporis quas molestias, vero dolorum tempora inventore cum dolore eum excepturi, fugit nam provident obcaecati,
        sed quidem quia velit dolores debitis magni? Quisquam laborum quaerat modi nemo. At corporis, provident illum
        modi ad beatae eius, nihil qui inventore blanditiis magnam, delectus aliquam eaque! Optio, voluptas dicta libero
        ipsum obcaecati temporibus ullam sapiente cum maiores! Dolores alias quas unde laudantium omnis, commodi
        voluptatum nisi, blanditiis doloribus necessitatibus assumenda debitis dolorum neque adipisci, quam ut
        exercitationem error ducimus! Delectus minima consequuntur ullam aliquam sapiente? Id eligendi quis recusandae
        beatae? Perferendis accusamus exercitationem omnis? Accusamus, ipsa perspiciatis. Hic doloribus dicta officia
        temporibus in aliquam fugiat! Quasi et suscipit accusantium illum autem voluptate repudiandae facilis assumenda
        possimus, officia, quo ut laboriosam ad recusandae natus modi nobis vero fugiat enim dolorum accusamus cumque
        quibusdam veniam. Error, ullam dolores id distinctio veritatis ut voluptate consequatur numquam libero ipsa
        reiciendis quibusdam eligendi illum fugit nisi, eos enim rem culpa? Voluptatem odit pariatur quasi quam officia
        adipisci! Corrupti explicabo nobis, obcaecati a beatae tempora eaque vero modi molestias, maiores iusto atque
        nam rem esse quidem quibusdam magnam harum enim accusantium molestiae odit nihil dicta eligendi. Veritatis
        adipisci, aliquid laborum unde placeat autem laboriosam itaque expedita repellendus exercitationem. Voluptates,
        consectetur debitis maiores doloremque repudiandae fugiat molestias ratione possimus unde ex nulla magni
        voluptatum minus praesentium voluptate illo! Magnam voluptatibus eaque dolore a odit ea, praesentium fugiat
        adipisci amet illum assumenda recusandae, ullam maxime voluptatem nemo natus consequuntur nobis aspernatur
        reprehenderit aut reiciendis earum, consequatur blanditiis mollitia. Ipsum fugit nostrum dolore modi dolorem
        sint nesciunt nisi assumenda deleniti rem voluptas sunt iure, temporibus quod earum hic repellendus illum.
        Maiores perferendis magni dolore necessitatibus sapiente saepe minima adipisci harum et ex, delectus non
        accusamus rerum ut. Autem id odit sit omnis fuga, obcaecati labore quibusdam, reiciendis veniam impedit harum
        recusandae optio eaque nemo neque ratione repellat. Veniam eos quos error saepe asperiores. Molestiae nulla at
        amet repudiandae corporis ducimus minus omnis eum consequuntur autem, quo error eius repellat praesentium quod
        quia voluptates iure explicabo possimus adipisci cumque iusto inventore harum? Rem deleniti cumque nihil ratione
        ea aut expedita beatae aliquid. Vel nobis quod commodi officiis animi accusantium earum eius magnam, ea ratione
        adipisci tempore debitis itaque rerum cum expedita qui aperiam perferendis sunt temporibus! Sit, dignissimos
        harum! Nisi voluptatibus et natus assumenda enim praesentium delectus quia? Quos, dolor molestiae cumque
        voluptate nulla fugiat eius dolores excepturi possimus ea, voluptas, illo quisquam distinctio. Illo eveniet
        nostrum saepe fuga nihil. Dolorem cumque officia ipsam soluta deserunt esse sit veniam magni laborum ad
        voluptatibus architecto magnam doloribus quis deleniti, nostrum laboriosam, similique nemo, suscipit cupiditate
        minus ut dolor ipsa? Voluptas omnis exercitationem adipisci. Voluptate odit error omnis nulla impedit id aliquam
        voluptatem vero, possimus quasi ex fugit quos earum officiis! Veniam qui voluptatum dolorem? Quas, non sequi.
        Doloribus dolor recusandae facere eveniet eum blanditiis rerum animi. Dicta cupiditate saepe inventore aliquam
        iusto, molestias, sit sunt veniam facere officiis debitis dolorum, voluptates non consectetur consequuntur
        ratione! Tempore aut temporibus repellendus iusto vero aliquid asperiores similique veritatis sed beatae
        adipisci voluptatem cupiditate inventore iure cum nulla possimus, natus harum, eius quisquam accusamus a unde
        dicta eum. Blanditiis iusto culpa illum commodi nihil atque non laudantium at, error veniam voluptate dolorem
        nam delectus totam nemo deleniti, eius quasi, cum libero ipsa recusandae? Rem sunt numquam quisquam tempore
        magnam, quaerat cumque quos voluptatibus eligendi facere modi ipsam recusandae iusto enim illum sint voluptatum
        quod veritatis. Cumque tempore minima modi corrupti quisquam, maiores incidunt pariatur sapiente dolorum, ipsa
        accusamus nam, delectus itaque voluptatibus. Ab, voluptatibus illo mollitia aliquid placeat, quia eaque deleniti
        sunt beatae omnis sit necessitatibus nihil sed tempora aliquam cupiditate quas dicta totam facilis repellendus
        voluptates numquam dolore! Veniam velit possimus exercitationem expedita, ad harum! Enim asperiores fuga dolore
        animi, et distinctio tenetur vel minima porro eveniet consectetur perferendis laudantium quisquam soluta aliquid
        autem placeat modi? Debitis saepe laborum dignissimos cum ipsum. Sit earum iusto ea, incidunt aspernatur autem
        porro, ipsam a iste odio nam recusandae!
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
