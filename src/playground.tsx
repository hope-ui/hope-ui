import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  createDisclosure,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
} from ".";
import {
  Anchor,
  Checkbox,
  createIcon,
  FormControl,
  FormLabel,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  SimpleGrid,
} from "./components";
import { useColorModeValue } from "./theme";

const IconEnvelope = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

const IconLockClosed = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M5 4.63601C5 3.76031 5.24219 3.1054 5.64323 2.67357C6.03934 2.24705 6.64582 1.9783 7.5014 1.9783C8.35745 1.9783 8.96306 2.24652 9.35823 2.67208C9.75838 3.10299 10 3.75708 10 4.63325V5.99999H5V4.63601ZM4 5.99999V4.63601C4 3.58148 4.29339 2.65754 4.91049 1.99307C5.53252 1.32329 6.42675 0.978302 7.5014 0.978302C8.57583 0.978302 9.46952 1.32233 10.091 1.99162C10.7076 2.65557 11 3.57896 11 4.63325V5.99999H12C12.5523 5.99999 13 6.44771 13 6.99999V13C13 13.5523 12.5523 14 12 14H3C2.44772 14 2 13.5523 2 13V6.99999C2 6.44771 2.44772 5.99999 3 5.99999H4ZM3 6.99999H12V13H3V6.99999Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

export function App() {
  const { toggleColorMode } = useColorMode();

  const inputVariant = useColorModeValue<InputProps["variant"]>("outline", "filled");

  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal opened={isOpen()} onClose={onClose} initialFocus="#firstName">
        <ModalOverlay />
        <ModalContent maxW="450px">
          <ModalCloseButton />
          <ModalHeader>Introduce yourself!</ModalHeader>
          <ModalBody>
            <SimpleGrid as="form" columns={2} gap="$4">
              <GridItem>
                <FormControl id="firstName" required>
                  <FormLabel>First name</FormLabel>
                  <Input variant={inputVariant()} placeholder="Your first name" />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="lastName" required>
                  <FormLabel>Last name</FormLabel>
                  <Input variant={inputVariant()} placeholder="Your last name" />
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl id="email" required>
                  <FormLabel>Email</FormLabel>
                  <InputGroup variant={inputVariant()}>
                    <InputLeftElement pointerEvents="none">
                      <IconEnvelope color="$neutral9" />
                    </InputLeftElement>
                    <Input type="email" placeholder="Your email" />
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl id="password" required>
                  <FormLabel>Password</FormLabel>
                  <InputGroup variant={inputVariant()}>
                    <InputLeftElement pointerEvents="none">
                      <IconLockClosed color="$neutral9" />
                    </InputLeftElement>
                    <Input type="password" placeholder="Password" />
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl id="confirmPassword" required>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup variant={inputVariant()}>
                    <InputLeftElement pointerEvents="none">
                      <IconLockClosed color="$neutral9" />
                    </InputLeftElement>
                    <Input type="password" placeholder="Confirm Password" />
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <Checkbox defaultChecked>I agree to sell my soul and privacy to this corporation</Checkbox>
              </GridItem>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <Anchor href="#" fontSize="$sm">
              Have an account? Login
            </Anchor>
            <Button type="submit" onClick={onClose}>
              Register
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam itaque ab nulla architecto vel accusantium
        ullam illum cum, officia, praesentium necessitatibus similique beatae libero reprehenderit nam quisquam,
        provident suscipit nesciunt eum mollitia exercitationem repellendus. Officiis molestias, animi, assumenda
        numquam ipsum quas nulla similique corrupti itaque officia, porro voluptates. Maxime animi, officiis enim
        placeat odio ullam expedita saepe non sed officia voluptatibus. Harum quidem doloremque voluptate, provident
        laborum fuga cum voluptatum voluptatibus voluptas distinctio, dicta modi in ipsam neque eveniet! Quo placeat
        neque rem tempore nulla, veritatis mollitia ut consequuntur cupiditate et delectus sequi quia architecto
        voluptatibus deleniti quam officiis voluptas beatae aliquid! Deserunt cupiditate in labore vel officiis
        reiciendis libero quibusdam enim voluptatem laudantium, illo saepe sint ratione vitae similique error officia
        aliquid itaque sunt earum! Nostrum quibusdam nulla necessitatibus sint, commodi porro magni quos nihil aliquam
        obcaecati id dolorem quaerat aperiam consequuntur voluptates fugit sapiente repellendus voluptatibus error sequi
        atque? Perferendis tenetur dolorum magnam, aspernatur quia praesentium earum est libero repudiandae similique
        fugiat, nulla deleniti. Explicabo, rem incidunt corrupti modi ratione eveniet natus eaque! Mollitia optio amet
        possimus laborum suscipit, necessitatibus expedita fugiat accusamus debitis repellat vero ab quaerat reiciendis
        magnam illo deserunt! A recusandae consequuntur labore sed? Eaque sunt, accusantium quisquam voluptate odit
        fugiat temporibus harum possimus minus! Ex a maxime doloremque quia, error hic dolores ea voluptatum saepe
        quidem commodi esse, eius debitis quae, corporis alias facilis adipisci enim voluptas est voluptatibus provident
        iusto! Porro numquam enim ipsa temporibus iure libero, tenetur quis, ex vitae ea incidunt in totam? Cupiditate
        necessitatibus ipsa beatae iusto voluptate quo quidem illum, voluptatem rerum, porro sequi hic minima ducimus
        alias perferendis enim atque ipsum totam odio tenetur possimus maiores officia fugiat. Explicabo deleniti minus
        consequatur inventore laboriosam omnis facilis accusamus unde natus officiis? Aliquid omnis, soluta veritatis
        voluptatem officia vero reiciendis, provident tempore, quae earum impedit repellendus? Reprehenderit ducimus
        nemo, suscipit voluptas doloribus, ipsum repellat beatae veritatis quos laborum debitis quia cum voluptatum
        aliquam iusto dignissimos repudiandae alias ex, voluptatibus saepe perspiciatis praesentium facere. Libero minus
        sint sed. Obcaecati at asperiores consequatur ducimus cumque harum quia expedita eaque quis, aliquam esse, quod
        delectus repellat quibusdam fuga. Dolores, et quos ex temporibus rerum illum eveniet voluptatum fugit ipsam
        porro repellat natus sed tenetur? Repellendus earum maxime repudiandae architecto optio veritatis laboriosam
        doloremque, ex sit pariatur consequuntur deleniti harum neque quasi corporis ea facere quidem nostrum
        voluptatibus quaerat iure error. Cum quam mollitia tempore dolorum sint perspiciatis labore provident neque
        eveniet quae? Velit quidem voluptate suscipit reiciendis perferendis iure! Et cum veritatis ullam culpa
        consequatur quas praesentium, deserunt sapiente, rerum qui quod suscipit, tempore illum? Voluptatibus voluptatum
        dolorem consectetur porro perspiciatis, ea magni, vitae rerum ducimus architecto velit veniam rem eos quia iure
        ipsa dignissimos voluptas amet quisquam consequatur ut! Eveniet laudantium odit excepturi expedita doloremque
        suscipit nostrum ad aliquid aspernatur blanditiis, corporis maiores beatae illo non dolor impedit assumenda
        atque, molestias tempora quo nisi magni ipsa amet? Incidunt atque eos eligendi fugiat deleniti voluptatibus
        tempora delectus distinctio officiis recusandae est obcaecati corrupti magni exercitationem, quia reiciendis in,
        doloribus explicabo quasi. Sequi et molestias inventore temporibus dolorum eius nemo, mollitia aperiam repellat
        rerum fugiat delectus fugit iste voluptatem iusto aspernatur alias! Recusandae delectus ea nulla at enim quod
        sit! Eaque iusto ipsa repellat. Atque dicta corporis voluptates asperiores cumque est nobis doloribus eveniet
        numquam dolor aspernatur inventore dolorum perspiciatis quod distinctio repellat mollitia suscipit placeat
        commodi, magnam sunt neque vitae sint minus. Iure facilis harum ab error ea expedita eum nemo perspiciatis
        reiciendis commodi dolorem, quod dolores aliquid quidem dolorum repellat recusandae distinctio enim aperiam
        tempore neque dignissimos fugiat assumenda laboriosam. Aliquam modi, tempora nobis asperiores blanditiis
        doloribus assumenda enim iusto ut. Maiores cupiditate, incidunt adipisci asperiores id quas recusandae
        distinctio tenetur facere voluptate, odio provident fugiat repellat, reprehenderit ipsam vel vero eius? Aperiam,
        officiis! Adipisci unde reiciendis, provident exercitationem, doloribus dolores saepe ullam maxime vitae numquam
        nulla ducimus sunt. Accusamus exercitationem modi dolores error fugit, iusto aspernatur culpa labore qui fuga
        saepe maxime necessitatibus veniam nam sapiente, amet vitae blanditiis deleniti totam provident officiis? Ullam
        quaerat, similique sunt quod deleniti iste, nesciunt placeat ducimus ipsum, totam aliquam maxime cumque adipisci
        delectus! Voluptates alias similique cumque perspiciatis amet libero cupiditate, voluptatum ducimus corporis.
        Officia consectetur dolore minus dolor blanditiis tempora illum doloremque ipsum odio totam, ducimus id
        doloribus unde impedit ad ea inventore. Maxime adipisci dolor iste natus labore nam quod cupiditate neque
        incidunt quo porro, deserunt delectus quasi laboriosam minus placeat temporibus ut at magnam, laborum, ullam
        esse ipsam vel omnis! At odio veniam fuga sapiente libero, ratione nam quidem adipisci eligendi corrupti eos
        laborum id iusto numquam a laboriosam magni dignissimos recusandae consectetur inventore delectus vero. Ducimus
        numquam quis accusantium quam rem laboriosam dicta neque aliquid sequi. Laudantium nisi, sapiente voluptas vero
        officiis necessitatibus ipsam earum soluta architecto recusandae quae molestias nam veniam cum! Eaque quas velit
        porro iste nihil accusantium facere, eligendi fugit laboriosam, hic, neque eius ex laudantium modi saepe itaque
        voluptates! Non ipsa sequi voluptas aspernatur voluptates est alias cum illum corrupti temporibus inventore
        harum numquam suscipit aperiam, illo earum doloribus atque, dolorum omnis. Dolor architecto sit, adipisci maxime
        numquam ratione aperiam praesentium deserunt, ullam itaque quidem debitis qui tempora ipsam blanditiis ea
        laboriosam reiciendis molestias atque rem veniam. Praesentium voluptatibus, delectus dolorum porro sit ipsum
        eveniet rem architecto harum esse quis nisi sapiente temporibus omnis dolor quasi eum sunt, consequuntur
        doloribus, exercitationem aliquam. Dolor in amet asperiores dicta repudiandae, reprehenderit maiores voluptates
        itaque deleniti officiis id eos ipsum non repellendus nemo doloremque suscipit mollitia iure minus eius minima?
        Aperiam dolorem perferendis obcaecati earum non placeat iste. Animi neque recusandae ipsa dolorem, ex veritatis
        corporis perspiciatis nobis debitis eum, facere vel. Nam qui doloremque reiciendis, assumenda deleniti, omnis
        eum, laudantium quos corrupti maiores quam architecto explicabo suscipit vero illo quod earum ut ipsa harum modi
        quisquam fugiat aliquid enim est. Voluptate dignissimos accusamus, aliquam nostrum necessitatibus optio ab rerum
        voluptas obcaecati illo, blanditiis repellendus in exercitationem architecto voluptatum quia quod delectus non,
        quae doloribus omnis! Quaerat magni maxime molestiae accusantium? Ab dolores deserunt incidunt corrupti
        doloribus voluptatum, sequi eveniet, ipsum nobis aliquam aut! Reprehenderit doloribus earum ea culpa pariatur
        numquam dolorem necessitatibus facere dicta voluptatum, eum, ullam ut. Quia vero eligendi aliquid laudantium
        quod ullam modi vel error pariatur libero blanditiis odio ipsa suscipit cum amet dolorem alias vitae facilis,
        iusto atque quo laboriosam. Unde, molestias, nam cumque accusantium suscipit sed aut ipsum numquam dolores quod
        delectus cupiditate autem obcaecati quas possimus voluptatum debitis soluta tempora at quam vitae nihil eum rem
        perferendis! Fugit asperiores voluptates cupiditate, iure laborum maiores non optio ea perferendis architecto
        labore suscipit iusto vero assumenda eius atque, mollitia veniam et, illo itaque doloremque explicabo sapiente
        placeat. Quae ad adipisci, distinctio sit dicta ullam, exercitationem aut inventore, laborum tempore natus
        facilis asperiores provident. Ipsa, voluptate voluptatem. Inventore quae, illo debitis saepe corporis commodi
        nesciunt, sapiente autem est voluptate error fugit. Hic facere, provident commodi debitis, earum consectetur
        animi cumque, dolores enim molestias laudantium fuga quis alias! Maiores omnis cumque nobis eligendi facere.
        Quae voluptatem porro laudantium nobis inventore omnis in quasi culpa laboriosam dolore ut soluta dolor debitis,
        vel est delectus quibusdam sunt ab aspernatur rem qui ipsam reiciendis minus molestiae? Mollitia error a
        temporibus nemo deserunt, dignissimos eius nulla maxime voluptate dicta vero accusamus minima corrupti molestias
        iste sapiente. Necessitatibus obcaecati ducimus recusandae accusantium perferendis ipsa molestiae quam quaerat
        nesciunt facere eveniet, porro qui doloribus rerum! Explicabo, sit ducimus expedita deserunt adipisci nulla,
        quaerat quas quo sint, voluptas accusamus? Blanditiis dolorum earum mollitia velit cumque sit, aperiam corrupti
        ducimus officia ex reiciendis eligendi harum sint possimus dolorem facere libero asperiores hic debitis nobis ab
        error adipisci? Vitae sit laborum ratione ipsa quos totam ut at tempora culpa praesentium? Saepe repellat
        commodi cupiditate et obcaecati officia nulla quae corrupti, soluta distinctio quasi eos sed impedit beatae vero
        sapiente quisquam modi quaerat corporis! Vel facilis unde culpa libero veritatis facere voluptatibus mollitia
        tenetur ipsa placeat praesentium animi qui sapiente dolores, totam ab amet nemo. Sunt natus iure eum,
        repellendus impedit, debitis architecto error excepturi quas quia dicta praesentium dolor neque voluptas quam
        illo expedita repudiandae ducimus explicabo laudantium ipsa! Cupiditate aut aperiam totam rerum doloremque
        ducimus necessitatibus veniam eveniet nostrum, error labore libero ab unde distinctio ad temporibus, voluptas
        consectetur qui, saepe deleniti. Illum reiciendis, dolores, quos nemo iure soluta aut deserunt maiores porro,
        tempora temporibus autem quasi illo accusantium laboriosam eligendi fugiat! Temporibus dignissimos quas alias,
        aperiam, facilis perspiciatis, aliquid iure iste voluptatem quis recusandae excepturi fugit velit eum porro vero
        veritatis officiis aliquam ut placeat illo debitis explicabo hic repudiandae? Ducimus, aut hic, et enim dolore
        delectus iure dolorem, dolores cumque quam aperiam aliquid eius voluptas quis? Dolores consectetur illo facere
        reiciendis amet asperiores fugiat incidunt cumque voluptatum, aliquam assumenda architecto nulla id corrupti
        dicta sint cum neque provident facilis accusantium aut impedit. Laborum aut fuga doloremque hic laboriosam
        architecto excepturi temporibus veniam consequuntur accusantium, maxime aperiam facilis soluta voluptatibus
        recusandae saepe cupiditate explicabo corrupti, assumenda officia at est unde sequi. Nostrum quos voluptas
        inventore ratione veritatis. Omnis, non, magni vel expedita ab rem iure amet fugiat, repellat alias cupiditate
        laboriosam recusandae corrupti quaerat assumenda debitis. Iure dolor tempora nulla accusamus iusto magnam
        pariatur fugit ad recusandae. Aut sequi debitis quasi, impedit, molestiae odio quia veritatis animi et,
        voluptatem unde! Minima reprehenderit eius provident ipsum culpa dolore saepe. Earum cupiditate natus, dolore
        voluptate consequuntur veritatis unde similique explicabo at porro neque, quos placeat corrupti harum, inventore
        facere deserunt quae possimus nobis provident illum! Rerum quia ullam culpa earum reprehenderit hic dolore
        sapiente modi accusantium fugit temporibus, excepturi asperiores ea harum illo possimus assumenda atque soluta
        provident tempore accusamus velit dolor! Iure quaerat quia quidem, temporibus voluptatem fugiat odit impedit.
        Ipsum cumque sit quo illum vero placeat, aspernatur praesentium reiciendis optio culpa, voluptas ullam
        voluptatibus omnis maxime beatae quis tenetur inventore labore asperiores adipisci minus, recusandae nam
        suscipit sequi. Blanditiis natus soluta nisi delectus facilis, harum, voluptatem perferendis aperiam illum
        cumque consequuntur autem est fugit suscipit excepturi. Alias veritatis ipsam dolorum atque omnis eos harum,
        iusto officia, ut quo minima nesciunt architecto, possimus mollitia. Quam suscipit omnis voluptates quia
        officiis quibusdam voluptatum quaerat neque animi, rerum exercitationem quos quis eveniet? Blanditiis nam ex
        commodi facilis optio ad quae ea odit id dolore reiciendis in minus, enim quod amet quia molestiae assumenda,
        beatae aut. Possimus sit mollitia consequatur non magnam, ipsum similique fugit enim pariatur magni esse, earum
        quam optio eius cupiditate quos voluptatibus officia deserunt dicta aspernatur sed aut excepturi molestias?
        Maiores veniam soluta maxime cum alias corporis? Est alias deleniti explicabo, laudantium, distinctio sapiente
        repellat eveniet eius, incidunt nemo veritatis similique quos molestiae soluta optio adipisci assumenda! Eum
        esse tenetur, expedita ullam veniam, sunt ipsa, quas consectetur odio qui eos ipsum amet. Dolorum, cupiditate
        repellat qui beatae rerum eum placeat vero soluta quam. Velit, tempora! Magni et asperiores facere blanditiis
        ullam culpa consectetur doloremque veniam repellat! Minus totam iure, ratione sit illum a velit possimus quaerat
        minima adipisci ipsum quis. A natus sunt ad laboriosam consectetur quasi voluptatem dolorum quibusdam ea! Qui
        soluta nobis illo quod quas quo officia voluptatum perspiciatis amet natus, mollitia doloremque dolorum fugiat
        atque. Fuga officiis perspiciatis dolores quam explicabo neque esse quos, quisquam quidem deleniti nihil illum
        quod sequi, iste consequuntur ipsam culpa sed? Quam similique repudiandae nemo officiis reiciendis, voluptates
        alias corporis sunt laborum adipisci, quasi porro mollitia corrupti ullam necessitatibus labore eveniet.
        Molestiae asperiores quidem reiciendis vel autem modi, corrupti dolore facilis sequi pariatur quasi quae
        voluptatibus eligendi quisquam sapiente libero magnam voluptatem obcaecati velit tenetur perspiciatis. Minima
        autem sunt mollitia illo. Aliquam quisquam maiores enim explicabo officia repellendus ullam dolorum obcaecati
        inventore reiciendis deleniti ducimus nulla at deserunt velit perspiciatis, magnam eum esse amet, necessitatibus
        voluptatum quos voluptate! Porro labore at illo reiciendis iusto sint id itaque dolore enim ipsam maxime quia
        officiis fugiat molestiae beatae, quo eius atque error esse similique obcaecati, corporis voluptates? Voluptatum
        ipsam corporis facere aliquam corrupti doloremque adipisci itaque amet possimus saepe! Repellat dolores quisquam
        in at recusandae aperiam id.
      </p>
    </Box>
  );
}

const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary1: "#fbfdff",
      primary2: "#f5faff",
      primary3: "#edf6ff",
      primary4: "#e1f0ff",
      primary5: "#cee7fe",
      primary6: "#b7d9f8",
      primary7: "#96c7f2",
      primary8: "#5eb0ef",
      primary9: "#0091ff",
      primary10: "#0081f1",
      primary11: "#006adc",
      primary12: "#00254d",
    },
  },
  darkTheme: {
    colors: {
      primary1: "#0f1720",
      primary2: "#0f1b2d",
      primary3: "#10243e",
      primary4: "#102a4c",
      primary5: "#0f3058",
      primary6: "#0d3868",
      primary7: "#0a4481",
      primary8: "#0954a5",
      primary9: "#0091ff",
      primary10: "#369eff",
      primary11: "#52a9ff",
      primary12: "#eaf6ff",
    },
  },
};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
