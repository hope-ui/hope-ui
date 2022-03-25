/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */

import "./playground.css";

import { createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
  VStack,
} from ".";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";

export function App() {
  const { toggleColorMode } = useColorMode();

  const [tabIndex, setTabIndex] = createSignal(0);

  const handleSliderChange = event => {
    setTabIndex(parseInt(event.target.value, 10));
  };

  const handleTabsChange = index => {
    setTabIndex(index);
  };

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <VStack spacing="$4" alignItems="flex-start">
        <input type="range" min="0" max="2" value={tabIndex()} onChange={handleSliderChange} />
        <For each={["underline", "outline", "cards", "pills"]}>
          {variant => (
            <Tabs variant={variant as any} index={tabIndex()} orientation="vertical" onChange={handleTabsChange}>
              <TabList>
                <Tab>One</Tab>
                <Tab>Two</Tab>
                <Tab>Three</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <p>one!</p>
                </TabPanel>
                <TabPanel>
                  <p>two!</p>
                </TabPanel>
                <TabPanel>
                  <p>three!</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </For>
      </VStack>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum officia animi rem officiis dolore libero, placeat
        beatae, eaque ipsam aliquid aspernatur illo fugiat fugit eum quisquam mollitia minus dolorem numquam veritatis
        sit. Nulla excepturi mollitia itaque similique unde ipsam ipsum suscipit molestiae, libero illo nemo praesentium
        quos tenetur eligendi dignissimos consequuntur officia incidunt! Qui velit delectus vero possimus non tempora
        sunt nisi dolores eaque magnam. Debitis quod provident voluptatem fuga repellat explicabo eum et optio ut!
        Reiciendis expedita sequi, pariatur sed doloribus veniam deleniti porro libero molestiae quaerat corporis dolore
        esse placeat vel. Suscipit dignissimos eligendi magnam aut sapiente porro ipsum officia quia accusamus expedita
        error placeat deserunt tenetur eius nostrum velit laborum, impedit eaque ut quibusdam omnis doloribus. Iste
        ipsum omnis molestias magnam vero commodi saepe vel natus eius doloribus illum qui, enim pariatur nihil facere
        culpa quia velit fuga adipisci dolorem quisquam recusandae. Quidem nobis ullam a consectetur rerum placeat
        dicta, illum esse quis sunt ipsam enim saepe impedit debitis natus in. Quo quam praesentium neque tenetur
        adipisci vero consequuntur ex cupiditate deserunt laborum minus placeat officiis omnis, doloremque officia
        incidunt sint blanditiis beatae repellat est aperiam corrupti provident atque! Enim, aspernatur, minus officia
        beatae vitae similique sequi amet magnam laborum molestias cumque! Dolores quae nemo ullam provident ea numquam
        soluta sed quibusdam sequi commodi. Eius saepe earum iusto expedita, repellat dolores. Distinctio vitae,
        incidunt architecto vero quasi eveniet iste natus. Facere fugiat optio et, quae nulla provident, fugit
        cupiditate maiores nostrum quasi repudiandae temporibus voluptatum, quod officia? Pariatur distinctio obcaecati
        accusantium explicabo quam provident ullam aspernatur in dolore asperiores, culpa voluptatum. Sunt laboriosam
        minus adipisci assumenda. Ullam, doloremque unde nisi animi tempora fuga doloribus incidunt culpa ratione
        perferendis? Corporis vero totam laudantium quibusdam. A quod voluptas, rem id voluptatem ea delectus? Iusto
        doloremque tempora quos nisi mollitia quas! Rerum consequatur nisi autem quod! Neque facilis animi sed libero
        ab, nesciunt saepe reiciendis assumenda harum velit placeat nulla accusantium delectus eum ipsam fuga
        repudiandae perspiciatis nobis, obcaecati natus, maiores a adipisci! Quo aliquam eaque quisquam sit possimus
        doloremque voluptatum. Ab quibusdam temporibus iure similique aut, illo maxime optio error sint, nam suscipit
        veniam cupiditate repellendus. Distinctio provident atque animi accusamus sit? Nihil, dolorum deserunt. Commodi
        facilis, sed fuga illum sequi soluta iusto unde blanditiis ut aspernatur quod quidem labore, itaque expedita
        ipsum voluptate nostrum aliquid! Tenetur sint eveniet vero ipsa quos facilis harum earum provident rerum, animi
        cupiditate fuga laboriosam corporis dignissimos, molestiae, a laborum? Facilis corporis doloribus commodi nobis
        cum eum, placeat ipsam fuga aliquid molestiae illum et! Ad laudantium unde delectus ipsum eligendi voluptate
        quam corrupti, expedita sed, earum amet dignissimos ab, aspernatur eos tempore cupiditate deserunt nostrum
        minima recusandae omnis blanditiis voluptatem aut? Tenetur sequi iure libero officiis eaque optio recusandae
        corrupti sint architecto ut natus error ea aspernatur quisquam minima, numquam culpa corporis alias eos?
        Voluptatum neque tenetur blanditiis consequuntur. Sequi voluptate iure, laborum fugiat non a quis corrupti
        consectetur sapiente distinctio dignissimos dolor consequatur vitae illum obcaecati modi ea? Ex error totam
        molestiae molestias corporis. Dolorum minima blanditiis recusandae dignissimos magnam fugiat repellat
        consequatur nesciunt omnis nemo suscipit ullam aperiam illum ipsa saepe laborum corrupti repellendus
        exercitationem voluptates porro, quae maiores dicta adipisci. Dicta temporibus exercitationem id dolor ullam
        tempore fugit quae voluptatum nisi animi. Necessitatibus, modi iste. Eligendi unde aliquam numquam aut atque!
        Hic cupiditate consectetur ipsa nisi quia dolorum, ab animi. Odit ut optio voluptate quasi repellat assumenda
        necessitatibus reprehenderit illo quibusdam neque, iusto quae voluptas laborum, saepe, voluptatum libero
        excepturi! Autem fuga amet culpa dolor temporibus dolore veniam commodi ipsa ut nobis accusantium tempore
        corporis error et, fugiat voluptatem sapiente veritatis explicabo hic ratione necessitatibus molestias
        voluptatum neque. Voluptates beatae molestias fugit vel accusamus incidunt sed cum quia praesentium molestiae,
        perferendis sunt libero quae atque, distinctio tempora nobis ex esse quam mollitia soluta veniam aperiam!
        Consectetur magnam, nostrum similique vero veniam consequatur deleniti ad beatae, ex odio reiciendis enim
        voluptatum pariatur minus consequuntur atque, minima maxime nobis? Consectetur doloremque quibusdam autem quia
        itaque iure officiis, fugiat quod magni! Animi dicta saepe eaque ex? Animi fuga temporibus omnis facere, vero
        obcaecati veritatis, ducimus quis eum debitis eius aperiam eveniet distinctio nesciunt nulla! Mollitia
        accusamus, inventore voluptatibus porro hic, sapiente incidunt impedit voluptas amet accusantium similique qui
        doloribus nam maiores quia natus. Quas, facilis vero, labore distinctio quam temporibus modi porro, deserunt
        magni repellat itaque quis explicabo commodi non aut ipsum mollitia facere aliquid a. Dolorum id consectetur
        dolore a nobis, magnam et omnis vel tenetur laborum incidunt illo corporis molestiae doloremque iure inventore,
        distinctio excepturi odit velit, autem voluptates aperiam? Consequatur maxime omnis minus nostrum praesentium
        adipisci aut dolorem dolor at itaque aliquid quo similique consequuntur quas inventore voluptatum laboriosam
        excepturi magnam, corporis ipsum? Dicta libero quisquam non provident hic est vero ut error assumenda expedita,
        reprehenderit repudiandae neque et in odit sint aut exercitationem corrupti sed. Rerum provident consequatur
        voluptatum ea tempore soluta, laborum sed quos ratione impedit aut! Natus, perferendis delectus reiciendis
        blanditiis, magnam animi repellat earum impedit nam harum laudantium officia nulla distinctio facere inventore
        explicabo enim corrupti soluta optio iure officiis ullam? Repellendus at eos nulla, beatae nisi omnis quidem
        minima aperiam libero sunt qui fugit quaerat quas deleniti error. Excepturi laborum quia corrupti, nulla dolor
        illum harum facere et ab natus a numquam ipsam repudiandae eligendi eum officiis quibusdam. Optio corrupti quae,
        cumque deleniti nobis in veniam magni soluta provident. Maiores, aliquam placeat vel amet tempora optio impedit
        accusantium error expedita quo natus aperiam aspernatur corrupti, voluptatem quas. Esse neque nihil eum numquam,
        nostrum explicabo dolorem repellat, perspiciatis nisi magnam, possimus eaque voluptas libero cumque. Quod
        facilis dolore fuga asperiores aliquam officia et corporis exercitationem facere labore fugit eum, suscipit
        veritatis accusantium odit beatae, deleniti impedit rem consequatur nihil, quis quaerat porro sunt quibusdam.
        Consequatur corrupti asperiores dignissimos voluptatum. Iure quasi quia cumque molestias, nisi placeat,
        asperiores hic explicabo, in exercitationem pariatur quibusdam consectetur? Officiis itaque deserunt pariatur
        nulla. Illo, hic voluptates. Dolore commodi, fuga repellat perferendis, saepe aperiam eius, rerum esse animi ad
        libero soluta nobis cumque. Eum architecto voluptatibus repellendus magnam ipsam minus modi reiciendis culpa
        natus, saepe eveniet illum labore ratione rem repellat facere, tenetur nemo, illo consequuntur maiores!
        Temporibus tempore facere aliquam sequi aut officiis expedita sapiente quos veniam blanditiis impedit adipisci
        minima dolores pariatur aperiam accusantium sit, consectetur eveniet perspiciatis assumenda? Et voluptas ullam
        doloribus accusantium tenetur neque ipsa error distinctio debitis id nam nesciunt, at dolore soluta
        necessitatibus libero aspernatur laudantium minus fuga, beatae quod omnis a praesentium quidem. Quo alias
        possimus, natus hic sint sapiente consequatur voluptatibus qui, nemo, laborum nam repudiandae aliquid vel fuga
        reiciendis eius maiores vitae veritatis mollitia. Fuga perspiciatis ullam necessitatibus, quibusdam perferendis
        similique iure, facere animi repellendus, consequuntur ex maxime et laborum nemo iste iusto ipsam atque! Iure
        cum quaerat laudantium quasi nam! Aspernatur excepturi numquam cumque cum sit assumenda in accusamus repellat
        sequi voluptatum autem soluta non recusandae ut, ea rerum, exercitationem provident veritatis, perspiciatis
        totam cupiditate incidunt? Recusandae minima sint ratione id quam nostrum et inventore corporis sapiente quasi
        beatae, unde laborum omnis libero, voluptate nulla, minus odit iste quidem placeat delectus. Error eos quisquam
        assumenda quo perferendis nam velit sed explicabo odit eum? Sit voluptas labore iusto, ullam obcaecati assumenda
        rerum facilis laboriosam dignissimos recusandae minima quos repellendus in! Nihil sint consequatur excepturi
        fugiat neque in, aliquid eveniet quam aut officiis at cupiditate alias rem quasi, voluptate itaque natus ducimus
        iusto aliquam dolore cum ratione? Perspiciatis ducimus iusto, nobis voluptates quia nesciunt culpa facere
        aspernatur at aliquid ad cum consequatur neque autem dolore illo recusandae earum non! Voluptatem, accusantium
        tempore. Incidunt cum maxime provident, laboriosam consectetur iusto amet possimus officiis placeat repellat
        fugit deserunt dolor quam nemo magnam necessitatibus tempore nobis nostrum aliquid unde tenetur error commodi.
        Sit dolor et temporibus quam quo culpa a ea reprehenderit, nulla nobis eligendi rem dolores at rerum officia
        ratione enim fugiat! Aperiam facilis nulla dignissimos iste similique adipisci praesentium obcaecati ea, illo
        officiis necessitatibus sunt neque a illum corporis quisquam. Amet at temporibus reprehenderit quae quaerat
        eveniet pariatur. Soluta, error harum distinctio ipsum, maxime non libero amet, nesciunt nobis reiciendis
        molestias quidem natus eum. Placeat qui necessitatibus eveniet culpa, numquam sequi maiores, eaque a voluptas
        iusto inventore, error quam omnis maxime. Adipisci aliquid quas, perferendis magni odio at eum cum ut, unde
        error aspernatur provident inventore non ad iste possimus voluptatem tempore delectus in? Ratione illo tempore
        illum earum numquam veritatis mollitia libero at, repellat accusamus alias? Eveniet cumque praesentium delectus
        odio enim corrupti neque impedit quidem, hic temporibus repudiandae ad pariatur ut officia velit, explicabo
        tempora modi, magni laborum quia distinctio ipsa. Dolorem, incidunt! Vel necessitatibus, deserunt quasi
        molestiae aspernatur quia blanditiis cupiditate soluta consequuntur voluptates aliquid ut illum assumenda quae
        impedit culpa velit libero fugit id perspiciatis cum. Nam omnis, culpa odit laboriosam aliquam ex repellat
        magnam natus quam animi blanditiis sunt voluptatem explicabo excepturi quidem labore quo beatae rerum totam
        doloremque. Adipisci, nemo? Delectus, adipisci excepturi velit quas exercitationem quasi commodi? Ex obcaecati
        quia ad quisquam nesciunt dignissimos voluptatibus blanditiis doloremque placeat quasi dicta sint suscipit
        assumenda, dolores et quae repellat optio! Voluptate, amet eos officiis neque totam maiores praesentium
        explicabo deleniti deserunt cumque quaerat iure quis porro, aperiam inventore. Molestias, consectetur!
        Laboriosam asperiores, qui velit, omnis quod alias sequi culpa natus itaque officiis odio earum adipisci aut
        consequatur labore deleniti mollitia illo doloribus tempore laudantium ducimus eaque quidem aperiam?
        Necessitatibus voluptatum dolorum reprehenderit amet nisi labore adipisci omnis a nobis dolorem, quo asperiores
        voluptatem in veritatis. Nobis laboriosam vel ex nisi, impedit tempore expedita accusamus autem temporibus
        tenetur placeat sit dolorum maiores dignissimos voluptatem assumenda ratione accusantium in saepe cumque
        delectus inventore. Saepe totam amet ipsa unde voluptatibus praesentium recusandae cupiditate ab obcaecati
        repudiandae doloribus delectus distinctio commodi officia corrupti, voluptas quasi consequatur vero officiis,
        aliquid incidunt aliquam cumque dolor id. Tempore libero accusantium eaque asperiores ipsam repudiandae,
        officiis porro molestiae, mollitia ratione nobis velit dolorum ducimus nulla at perspiciatis aspernatur.
        Dignissimos voluptate dolores ipsum quia, earum error nesciunt minima deserunt aliquid animi beatae dicta
        commodi doloremque alias iure, nisi minus incidunt totam quaerat officiis placeat optio neque ratione
        consequatur! Quam, id. Nihil ea, voluptates beatae omnis aperiam nesciunt! Ipsa optio tempora temporibus autem
        molestias voluptatem natus facilis impedit, architecto tempore dolorem. Odit facere accusantium magnam! Itaque
        blanditiis, aperiam aliquid veritatis numquam deserunt eaque dolorem reprehenderit ab quasi quae delectus
        deleniti cupiditate natus porro laboriosam facere suscipit amet. Temporibus beatae, officiis impedit provident
        ut ipsum repellat atque vel nulla autem deserunt similique culpa aperiam voluptas, consequuntur voluptatibus
        quia iusto veritatis! Expedita autem explicabo sed nostrum esse, vel dolores excepturi magni id molestias iusto
        porro illum non totam atque ullam ipsa eaque nemo? Sint, voluptatem fugiat. Reprehenderit earum porro aliquid
        voluptas illum pariatur magni, nam, adipisci dolor asperiores inventore similique veritatis repudiandae
        necessitatibus nihil facilis reiciendis ipsam eaque quae. Consequatur nam corporis dolor. Neque perspiciatis
        facere commodi repellat modi repudiandae possimus a nostrum vero, quisquam aperiam eius ratione tempora quas
        odio aliquid odit ipsum expedita necessitatibus id sit aspernatur voluptatem! Pariatur sint, doloremque cum
        blanditiis error atque dolores, esse dolor ex voluptates nulla modi! Fuga similique, ipsum corporis eos sint
        ratione quia itaque nisi error odit accusantium rem reiciendis adipisci eius aliquid non a blanditiis beatae,
        magnam nemo quaerat quod culpa! Hic sit voluptate corporis et itaque expedita? Repellat repudiandae nesciunt
        consectetur quod voluptate officiis harum possimus provident molestiae. Voluptatem ratione quia sunt nisi
        quaerat, explicabo quas saepe excepturi sed error amet repudiandae officiis nostrum magnam, fugit adipisci quam
        culpa, inventore quidem. Quaerat, beatae! Quidem, dolorum neque veritatis ut voluptatem accusamus voluptates
        blanditiis corporis nesciunt quia sapiente obcaecati aperiam aliquam non eligendi deserunt et nobis impedit
        repudiandae ipsum omnis quos quisquam est reprehenderit. Placeat voluptate vero similique debitis aspernatur,
        quidem doloremque a sequi fugit accusamus distinctio dolorum tempora nam cumque incidunt quos quibusdam velit?
        Obcaecati velit commodi veritatis incidunt soluta! Reiciendis saepe unde tempore minus quas vero molestias,
        maiores amet nemo. Quod eius illum reiciendis nobis perspiciatis nostrum excepturi, quae, nemo similique
        laboriosam esse odit pariatur cumque doloremque, necessitatibus ut voluptatum!
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
