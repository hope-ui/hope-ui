import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  ButtonGroup,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
} from ".";
import { Center } from "./components";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <Popover>
        <PopoverTrigger as={Button}>Basic</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover triggerType="hover">
        <PopoverTrigger as={Button}>Hover</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover initialFocus="#next" placement="right-end">
        <PopoverTrigger as={Button}>Custom</PopoverTrigger>
        <PopoverContent color="white" bg="$info11" borderColor="$info11">
          <PopoverHeader pt="$4" fontWeight="$bold" border="0">
            Manage Your Channels
          </PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore.
          </PopoverBody>
          <PopoverFooter border="0" d="flex" alignItems="center" justifyContent="space-between" pb="$4">
            <Box fontSize="$sm">Step 2 of 4</Box>
            <ButtonGroup size="sm">
              <Button colorScheme="success">Setup Email</Button>
              <Button id="next" colorScheme="info">
                Next
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt consequuntur quas maxime mollitia vel beatae.
        Magnam praesentium quis omnis debitis provident vitae maiores, consectetur maxime ipsam asperiores sapiente
        possimus voluptatum esse deserunt voluptate nisi veniam nulla? Iure fuga sit nihil quasi! Expedita doloremque
        soluta repudiandae voluptates porro! Non, blanditiis libero? Ut rerum ratione, eos neque illo nesciunt
        laudantium nostrum corrupti temporibus est quo, sit molestiae aliquam quae repellat delectus eligendi nihil
        dignissimos laboriosam magnam natus, dicta aut. Id rerum obcaecati suscipit dolorum porro eos, et totam fuga
        voluptatum veniam aperiam architecto? Maiores possimus ipsam nesciunt! In asperiores sint maxime architecto
        culpa? Ea maiores assumenda neque doloremque minus possimus reprehenderit. Nostrum voluptatem quae sequi
        laboriosam sed, asperiores quisquam deserunt ab minus enim maiores a at fuga facilis repellendus culpa cum eum
        voluptas iure? Modi unde, neque fugit aliquid sit autem dolorem, exercitationem magnam provident vero vitae
        voluptatum consequuntur non quidem. Dolores, doloremque. Eius dicta atque iure accusamus. Assumenda obcaecati
        quaerat omnis temporibus earum? Earum quisquam porro iure ipsum facilis. Laborum voluptatem nobis amet alias
        animi? Illum sit a ea fugit alias asperiores possimus quaerat, voluptas commodi nam voluptatem, id porro totam
        rem iste aperiam exercitationem quidem in corrupti placeat inventore deserunt! Dignissimos ab aliquid maxime
        consectetur voluptate iste necessitatibus iusto consequuntur fugit minus, harum ducimus cupiditate ratione
        aliquam dicta. Voluptatum cum minima corporis minus, tempore doloremque alias et, eveniet deserunt maiores hic
        magni dolorum aspernatur aliquam soluta quasi eaque facere expedita quas non dolorem in aliquid quaerat
        dignissimos! Blanditiis, impedit consequuntur eveniet earum repellendus laudantium voluptates odit nesciunt
        ratione numquam quos similique modi assumenda, tempore saepe totam sed! Excepturi quis sit vel odio qui dolores
        perferendis repellendus aut, minus a dignissimos perspiciatis facere quo quidem facilis amet! Delectus maxime
        doloribus quae porro explicabo id tempora nisi excepturi, similique dicta ipsam quibusdam odio, dolor velit
        assumenda tempore officia animi accusamus ad! Tempore dignissimos maiores vel ad libero non! Ea, iure quidem? Ad
        asperiores minima nemo explicabo illo perferendis quo non sint id. Cum dolorum vero quas eveniet aliquid est
        recusandae quis animi magni reiciendis non qui distinctio eius illo voluptatum, molestiae quidem quisquam maxime
        repellendus ipsam praesentium rem quam cupiditate. Expedita ex corrupti, praesentium nihil commodi tenetur, ab
        ipsam enim eius quos aliquid totam magnam! Deleniti voluptates, dolor, repellendus corporis quibusdam explicabo
        nihil enim distinctio aliquam placeat fuga? Vero dolore voluptates labore nesciunt ipsa aut fugiat libero! Dicta
        placeat officiis veritatis ab ratione asperiores ipsa magnam, dolorem excepturi cupiditate quo deleniti
        voluptatibus tempore fugiat, ad quia? Obcaecati et rem odio facere? Dignissimos tempore consectetur ea dolor
        ratione dolores eos sapiente error cupiditate placeat id, minima et porro dolorum fugiat velit? Tempora,
        quisquam! Dolorem animi natus, quam aliquid fuga quibusdam modi perspiciatis nulla dolorum accusamus expedita
        illo tempora, maxime incidunt totam enim vero ipsa quod blanditiis. Est cupiditate deserunt voluptatum sit magni
        esse inventore veniam ipsa eaque alias reprehenderit sed tempore libero consequuntur minima a vitae, illo
        necessitatibus deleniti adipisci minus hic et. Corporis porro ipsum aliquam earum, reprehenderit nam sit hic
        ullam!
      </p>
      <Center boxSize="$full">
        <Popover>
          <PopoverTrigger as={Button}>Basic</PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Confirmation!</PopoverHeader>
            <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
          </PopoverContent>
        </Popover>
      </Center>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam, repudiandae! Molestias laudantium harum
        asperiores assumenda iste, adipisci cumque soluta facilis eligendi sequi. Quidem animi maxime iusto molestias ad
        sunt provident nostrum optio distinctio, dicta ut aperiam vero eaque id incidunt odio, recusandae doloribus
        officiis voluptatem voluptas nam! Mollitia eligendi soluta ea adipisci fugit doloremque non cumque. Molestias
        optio ex atque. Neque numquam asperiores molestias odio facilis assumenda minima explicabo sapiente officiis.
        Perferendis facere laboriosam nisi nam tenetur corrupti, nulla quidem fuga ipsum est debitis aperiam, molestias
        delectus quaerat? Nihil omnis saepe facere exercitationem enim soluta aut voluptate inventore odio, eaque
        impedit at. Itaque soluta tempore voluptas harum veritatis quisquam asperiores, ab enim voluptates nihil quidem
        nisi est quo non, illo dolor nesciunt sunt cupiditate. Voluptatum veritatis soluta, omnis assumenda, quia
        obcaecati natus in earum eum culpa accusamus nemo, aspernatur aperiam rerum? Maxime optio eius, veritatis quam
        quaerat saepe illum animi repellendus nihil aspernatur esse sint quibusdam molestiae debitis officia quis quasi,
        mollitia provident odio corporis earum. Quaerat repellendus illo accusamus modi iure eveniet, ut delectus
        maxime. Dolore, unde placeat voluptatem ex porro accusamus ipsam. Ipsa delectus quas aliquam. Voluptas
        necessitatibus corporis odio tempora laboriosam consequuntur neque, commodi hic doloribus a nulla ad iusto rem
        similique recusandae ratione facere quibusdam nihil incidunt repellat est! Officia facere consequuntur
        voluptates inventore nam eum nobis non quas ducimus assumenda deleniti voluptate, corporis ut molestias fugiat
        quibusdam dolores amet blanditiis. Eaque voluptatibus deleniti tenetur autem fugit quae iste similique, natus
        ipsa incidunt veniam molestiae minus repellat, cum iure ipsum velit doloremque sint, dolore delectus sit facere
        alias at illo. Saepe vitae eius tempore, blanditiis quis deleniti molestiae delectus fugiat corporis quos,
        eligendi exercitationem neque culpa est suscipit rerum enim quae placeat dolor asperiores error libero non
        quibusdam eveniet. Tenetur cum optio perspiciatis corrupti voluptatibus molestias, explicabo assumenda labore
        iure blanditiis eos quae est sequi doloremque expedita accusantium, quod dolorum incidunt modi. Laudantium, eius
        est ipsam dolorum distinctio doloremque deserunt temporibus aperiam quae sapiente. Itaque temporibus beatae
        eius? Provident commodi voluptate, alias in nam, eos odit eum labore quas rerum eaque culpa quasi doloribus,
        consequatur asperiores unde libero ea odio sit fuga perspiciatis incidunt nostrum ullam quibusdam. Inventore,
        fuga nobis illum eveniet unde aut. Saepe quam ad esse hic perspiciatis sed consectetur accusantium non.
        Assumenda libero voluptate velit temporibus minus corrupti molestiae. Amet dicta expedita voluptatem perferendis
        quis tempore illum, quasi dolores at non ut sit corrupti ducimus eligendi odit perspiciatis voluptas sint sequi
        ullam possimus. Libero deleniti, perferendis quas quaerat dolorum cumque, nesciunt in ducimus officia, quibusdam
        commodi inventore amet magni sed dicta iure labore quis. Saepe officiis explicabo sed similique laborum a natus
        aspernatur quia quam, quisquam impedit iusto accusamus vitae aperiam praesentium voluptatibus id, deserunt
        excepturi vero maxime. Eos ducimus et unde eligendi odit explicabo cupiditate neque recusandae repudiandae nisi
        odio non tempore voluptatibus, illo consectetur esse earum aliquid distinctio corporis exercitationem impedit
        enim natus! Provident, iusto? Similique assumenda non possimus ipsum necessitatibus corporis consequatur
        reprehenderit laudantium nemo tempora dolores facere suscipit eveniet id cumque laboriosam veritatis itaque
        alias, dolorum natus, iure recusandae, quae ex. Sunt, impedit eligendi incidunt blanditiis ipsum deleniti eum
        alias quae aliquam cumque consequatur praesentium ullam laborum, repellendus suscipit voluptas odio soluta
        maiores officia cupiditate in repellat accusamus! Odit ab quaerat sit pariatur! Amet nesciunt, nam incidunt cum,
        doloremque earum adipisci similique culpa odit ex quaerat nulla ipsa? Esse ullam vel reiciendis quasi voluptas
        consequuntur eaque aliquam officia ex recusandae quam consectetur officiis eos minus praesentium animi, labore
        magnam obcaecati repudiandae a. Suscipit unde temporibus explicabo ab sapiente deserunt, eveniet quas totam
        culpa natus sequi reprehenderit vitae autem maiores distinctio non veniam tempora animi delectus nulla! Beatae
        alias quasi modi vero saepe eius nesciunt consequatur sint rerum voluptatum ullam aliquam eveniet quod ipsa,
        ratione accusantium ducimus dolorem, quis sit id quibusdam praesentium cum animi. Reprehenderit, quis odio.
        Assumenda repellat cumque veniam magni accusamus repellendus, vero aperiam molestias odio amet, repudiandae nam
        provident. Velit ratione doloribus soluta saepe. Neque quos quasi in iusto, sequi velit illum aspernatur
        pariatur voluptate laudantium quod sapiente? Ad amet est dolorum, nisi atque iure beatae molestias eum error,
        quis totam libero! Nam eaque consequatur cum quo nisi iure tempore explicabo et, at, asperiores dolore itaque
        nobis quia impedit repellat excepturi nemo reprehenderit a magnam error temporibus! Voluptas unde veritatis
        alias natus expedita veniam nobis, soluta autem culpa, cupiditate nesciunt eaque enim ratione error velit
        deleniti magni. Id quis praesentium qui dolores esse suscipit rem! Harum perferendis sed, consequuntur labore
        rem quo totam ullam accusantium nihil, perspiciatis culpa illo fuga qui minima eos iusto. Quia tenetur iusto sed
        aperiam recusandae dolor quo cupiditate, distinctio, obcaecati commodi accusamus dolore optio. Consectetur dolor
        rem consequuntur nisi illo reprehenderit ea aut placeat. Itaque, dolorem voluptas! Sapiente reprehenderit vero
        blanditiis quos vitae eius earum quae ipsa, dolores beatae iste laudantium excepturi a recusandae maxime eaque
        ut optio culpa placeat eum minus, impedit asperiores. Eveniet nobis delectus numquam animi harum debitis
        adipisci corrupti exercitationem, sit molestias vero error doloribus aut illum et quibusdam doloremque tenetur
        dolorum neque eos modi unde! Labore aperiam illum, dolorum ea mollitia voluptatibus soluta, hic quod ex veniam
        voluptate dolor perspiciatis eius, dignissimos fuga. Distinctio, nihil repellat quod voluptate non fuga numquam!
        Quo omnis magnam corporis nemo modi officiis ea autem dolore voluptates. Dolor assumenda minus reprehenderit,
        quibusdam saepe maiores magnam laborum ad incidunt quia, reiciendis tenetur neque alias doloribus accusamus
        ducimus vitae aspernatur? Debitis nulla iusto odio adipisci ut veritatis, eos dolorum rem doloribus optio.
        Exercitationem labore necessitatibus explicabo inventore quia numquam repellendus. Pariatur quam nostrum
        aliquid. Error, dolore ex. Reprehenderit, officiis. Id quia dolore velit facilis necessitatibus consectetur
        eaque porro voluptas veritatis, inventore sunt fugit molestiae libero illum provident officia quam aut corporis
        vero unde tempore tenetur, ducimus incidunt. Unde aliquid impedit commodi veniam est itaque nesciunt minima ab
        sequi! Obcaecati quo deserunt ut tempore voluptate quam cupiditate animi architecto velit, molestiae explicabo
        blanditiis hic dolorum, sint similique amet impedit nihil delectus error reiciendis! Quaerat earum ducimus velit
        sit quasi modi numquam iure! Ullam officiis repellendus corrupti corporis, tenetur asperiores dignissimos
        aliquam placeat atque velit, possimus reiciendis autem? Velit architecto nostrum ab quod? Rem architecto
        eligendi et ipsum numquam. Illum exercitationem eligendi animi? Id commodi architecto soluta veritatis
        cupiditate fuga, minima a odio! Iste officia consequatur eligendi ab suscipit quibusdam voluptatem maxime fuga
        ullam nihil? Magni neque repellat temporibus enim quis pariatur numquam nulla delectus qui maiores veniam
        voluptatem rerum aspernatur corrupti sunt similique dolor inventore suscipit, repudiandae minus quaerat optio
        odio? Quaerat voluptatum et, reiciendis odio alias doloribus possimus harum vitae fugiat repellat? Vel quae,
        porro mollitia aspernatur ea consequuntur sapiente cupiditate officiis sed expedita ipsam repellat similique
        vitae eaque est placeat repudiandae, reprehenderit atque inventore nisi beatae incidunt? Vitae dolor magnam quod
        inventore nemo fugit rerum officiis accusantium sunt sint! Dignissimos culpa, aperiam veniam, earum asperiores
        eius ipsa voluptates qui, repellendus quia facere eos odio quos ad exercitationem sed voluptas totam! Quia
        distinctio temporibus possimus. Ea voluptate explicabo quas id excepturi saepe possimus esse dolores eveniet
        iusto ipsam repudiandae ad molestias voluptatibus laudantium ex itaque reiciendis veniam beatae, illo dolorum
        totam animi minima omnis. Sequi ducimus adipisci reprehenderit illum delectus dolores, tempora quo eum voluptas
        dolore praesentium, cupiditate facilis dignissimos, quibusdam qui ullam voluptatibus reiciendis harum aperiam
        consequatur sint modi. Dolorem aperiam dolore nostrum saepe minima necessitatibus maiores, ut in deleniti
        architecto expedita. Hic, asperiores maiores deserunt et incidunt harum cum totam rerum enim, unde, quasi
        voluptate quod? Suscipit repudiandae sapiente eaque obcaecati nesciunt doloremque quisquam neque quibusdam,
        voluptatibus temporibus excepturi quae sint autem dolores iusto vel, nisi iure voluptatum earum. Eligendi error
        recusandae dolores? Ex reprehenderit eius est laboriosam. Modi nemo tempore soluta minima iste quisquam a
        perferendis porro voluptates sit. Numquam magni, suscipit ullam repudiandae ipsa impedit nisi! Placeat omnis
        iste sapiente voluptatum ullam obcaecati, hic soluta. Nisi et hic quae libero cumque doloremque quidem ad error
        esse, cupiditate provident inventore! Et nulla vero esse unde dolorem consequuntur eum quod possimus obcaecati
        recusandae cumque rerum commodi, minus ratione quidem, deleniti iusto, hic impedit nemo dolore odio odit sed
        sunt. Tempora sed vitae recusandae facilis totam nihil, omnis in adipisci repellat, molestiae illum unde natus
        saepe eum cum harum, expedita similique. Facere, tempore ipsa earum voluptates id deleniti, reiciendis in itaque
        et, asperiores laboriosam fuga ab? Praesentium iusto odio expedita perspiciatis voluptates doloremque quibusdam,
        quod ratione quo. Neque quaerat totam fugiat quod voluptates blanditiis sapiente optio nesciunt incidunt commodi
        tempora quisquam quibusdam error, earum iure voluptatum. Perferendis, possimus? Voluptatibus, unde. Odit
        consequatur obcaecati laborum repellat, expedita aperiam cum molestiae molestias iste sed ducimus dolorum eos
        quaerat dolores ipsum eaque maiores vitae sunt ipsam, fugit numquam repudiandae accusantium assumenda est. Quasi
        repudiandae, architecto quisquam pariatur consectetur mollitia dolor optio tenetur, reiciendis sit, expedita
        voluptates iusto molestiae culpa. Dolorum qui enim nemo quaerat vero quam, accusantium corporis obcaecati eius
        eaque mollitia, tempora, molestiae sapiente commodi voluptas quibusdam perspiciatis minus ea ipsum suscipit
        voluptatibus. Veniam tempora omnis nesciunt laborum a ex voluptatibus unde repudiandae error nobis atque
        expedita itaque illum voluptates impedit dolores eum pariatur, fuga sint numquam deleniti, obcaecati dolorum
        ratione! Possimus quibusdam provident obcaecati aperiam magni. Animi iure voluptate repellendus numquam corporis
        dolores laborum qui sed facilis, nulla amet soluta accusamus nemo explicabo similique nesciunt delectus
        molestias tenetur sapiente quas eos nobis deserunt asperiores dolore. Aut reprehenderit totam quibusdam quae
        dolores asperiores et quasi voluptatum maxime quo cumque atque magni laboriosam veritatis quod assumenda odit ab
        ex laborum, quis minima fugiat! Sit labore hic doloremque itaque inventore praesentium asperiores suscipit
        accusamus. Ratione accusantium facere aliquid laboriosam culpa cupiditate, repellendus eius totam saepe sequi,
        vitae nemo. Iste, pariatur placeat! Perferendis impedit sequi commodi rem magni nemo. Suscipit eius deserunt
        excepturi similique. Eveniet modi expedita rerum ab beatae iste totam, adipisci velit minima repellat. Explicabo
        sed id modi, repudiandae ducimus itaque aut nulla iusto nisi assumenda deleniti hic corrupti temporibus
        aspernatur delectus dolorum voluptate dolorem distinctio at deserunt ex! Quibusdam perferendis cumque, itaque
        laboriosam aspernatur fuga recusandae ipsam vel dolores numquam aperiam est? Odit tempora optio facilis illo
        hic. Ab quisquam dolorum repellat impedit labore obcaecati aperiam illo! Reiciendis ducimus labore consectetur
        aliquid, quam optio est mollitia repudiandae inventore fugit distinctio suscipit accusantium, molestias quia
        cupiditate nobis. Asperiores voluptates minima delectus doloremque explicabo! Sunt enim dolores amet magnam vero
        facilis vel labore nesciunt alias aliquid optio quisquam sint accusamus quia voluptatem molestias, laudantium
        beatae iste exercitationem. Illo libero inventore voluptatum magnam obcaecati rerum mollitia reiciendis quis,
        similique eos ipsum ex, cupiditate delectus saepe consequatur? Temporibus animi debitis magni voluptatum
        architecto mollitia sapiente et ullam perferendis, aliquid consequatur at ducimus nulla nisi sint illo
        cupiditate modi, perspiciatis non vel, suscipit autem corrupti impedit? Dolor distinctio voluptas sequi
        explicabo eos exercitationem deserunt omnis perspiciatis, id dignissimos. Qui debitis inventore vero! Minus, est
        temporibus numquam quo sint doloribus harum alias nobis sunt? Pariatur praesentium eveniet optio tempore nemo,
        eius sunt blanditiis nesciunt ullam vel. Sed ut, nam veniam ducimus odit, repellat voluptatem praesentium et
        quam quia doloribus error expedita, quis nihil impedit facere iste? Quod atque quaerat minima laboriosam ea
        maiores. Quisquam error facere porro odit. Earum quia minus nesciunt laboriosam voluptas officia consectetur, ea
        beatae nihil corrupti assumenda! Sint possimus consectetur sed repellendus id animi harum in cumque est tempore
        minima, nisi quo maiores ducimus eos sequi at necessitatibus suscipit et numquam! Tempore minima exercitationem
        magnam. Consequatur commodi quam facere nobis? Eveniet, molestiae? Molestiae eum officia inventore repellendus
        natus! Repellendus sed, dolores vitae recusandae cum quas ducimus, voluptatum nam nostrum libero magni quo, amet
        ipsa corrupti eius sunt debitis! At ducimus aperiam, delectus iusto neque quis alias saepe error quidem vel
        dolore. Exercitationem non officia quidem porro sint ab qui natus molestias ex eveniet omnis itaque quae, neque
        deserunt! Modi est saepe officiis deserunt natus, provident ex ratione, consequatur sequi minima laudantium
        temporibus tempora officia placeat sunt voluptate repellat eaque quaerat aliquid. Repellat consectetur iste
        aliquid quam accusantium blanditiis provident, ducimus voluptas tempora velit? Voluptatum minima, illo et,
        veritatis esse minus sequi quos eius, repellendus ipsum nihil fugit deleniti recusandae. Voluptate fugit, eaque
        expedita possimus pariatur molestias.
      </p>
    </Box>
  );
}

const config: HopeThemeConfig = {};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
