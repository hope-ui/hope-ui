import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  SimpleSelect,
  SimpleOption,
  MenuTrigger,
  useColorMode,
  VStack,
} from ".";
import { IconCrossCircle } from "./components/icons/IconCrossCircle";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi provident excepturi minima itaque voluptatum
        cumque eos voluptas deserunt, corporis ex ipsum alias, eveniet voluptates molestiae illo quia voluptatem
        exercitationem? Eaque doloribus omnis repellat tempora culpa, debitis eos maiores dolor consequuntur error
        impedit eligendi alias. Assumenda quisquam asperiores delectus ducimus dolore quam veniam porro reiciendis
        soluta placeat, dolores omnis modi officiis dignissimos dolorem. Recusandae aliquam natus suscipit, unde
        voluptatum, harum itaque, rem aperiam quisquam tempore molestiae soluta tenetur. Ipsum sed molestiae autem neque
        labore nesciunt corporis beatae dolores repellendus placeat! Sapiente officia quam dolores quo ipsam dignissimos
        aspernatur expedita impedit aut, asperiores autem ipsum molestias cum aperiam provident eos? Eos fugiat
        asperiores voluptates id obcaecati delectus quia culpa soluta, eaque numquam magnam dolorum sit nostrum magni
        rerum ratione deleniti praesentium voluptatibus doloremque. Quam laboriosam quod quibusdam iure, officiis aut.
        Excepturi odit similique a. Porro, error doloribus obcaecati libero ipsam odio exercitationem! Quia quisquam
        odio voluptatum ipsum reiciendis reprehenderit fugit voluptas voluptate veritatis. Laboriosam consectetur
        placeat at esse possimus error quasi, id, ex dolorem iusto repellat voluptatum eos ipsum nihil impedit eligendi
        facilis aspernatur laudantium quod odio repellendus omnis est atque. Veritatis ad itaque repellendus, quibusdam
        recusandae eius magnam debitis accusantium laborum cumque? Quam alias sunt nihil eveniet error, corrupti
        exercitationem ex eos, totam neque perspiciatis. Laboriosam, nemo suscipit porro odio atque unde nesciunt
        doloribus id rerum iste! Perferendis ipsa voluptatibus unde libero itaque eos totam ducimus similique impedit
        quasi consequuntur eveniet quidem eius, nobis a, fugiat, doloribus sed. Consequatur atque nihil dolorum debitis,
        itaque eius, vitae totam qui exercitationem repellat reiciendis odit laudantium voluptates numquam. Quod libero
        est accusamus animi vel quasi laborum. Officiis tenetur alias sequi vel at aspernatur repudiandae, doloremque
        ipsum tempore, veritatis est quas voluptates magni necessitatibus, ab fugiat inventore excepturi fuga
        praesentium illo corrupti eligendi aliquid officia porro. Excepturi nihil itaque sunt voluptatem quae rerum rem,
        delectus illum eveniet quos non quo expedita quibusdam ratione ea unde laudantium commodi fugiat? Rerum tempora
        voluptates officiis consectetur provident fuga dolore, architecto hic assumenda eius at aperiam, adipisci
        cupiditate inventore porro eligendi illo. Dicta excepturi perferendis ipsam rem tenetur esse quisquam sunt. Sint
        expedita est reiciendis excepturi accusamus cumque, aspernatur, dignissimos ex rerum distinctio aperiam deserunt
        obcaecati autem ullam modi voluptatem officia debitis sit necessitatibus at minus vitae dicta voluptas
        architecto. Magnam sint voluptate nam similique odio sed, fugit molestias expedita officia quis ratione.
        Repudiandae harum maxime ducimus officia et eos architecto, voluptatum vitae minima cupiditate fugiat eius odio
        expedita corporis dolore unde pariatur in fugit. Doloremque amet atque dolorum perspiciatis sequi ab velit
        necessitatibus, at voluptatibus quaerat quas, quidem quam incidunt delectus. Alias animi vitae facere enim sed,
        ab rerum quia deserunt voluptatem nisi labore dolorum repudiandae porro! Ad dolorum dolor harum neque, porro
        amet, officia debitis repudiandae veritatis aliquam quam quidem magnam. Delectus, sunt! Voluptas quod iusto
        alias modi dolore exercitationem eos voluptatem quo. Cum odio laudantium, ipsam nam ducimus accusamus rerum
        porro tempore enim facilis, maxime quidem distinctio nobis voluptatum officiis. Pariatur nulla sint veritatis
        repudiandae accusantium nemo eius excepturi aspernatur dolorem ullam impedit voluptate quaerat distinctio sit,
        dolorum velit veniam! Minus modi quia voluptas perferendis, voluptates quis suscipit ipsam praesentium? Dicta
        voluptatem porro quaerat quisquam, architecto harum quia pariatur dolorum cumque accusantium iusto, itaque
        perspiciatis impedit a hic, error in? Illum inventore autem vel et quidem eligendi sint voluptates eveniet illo
        quas doloribus ea quisquam, aliquid ullam qui, ut doloremque aperiam, eius corrupti reiciendis deleniti enim
        error iusto! Quod quaerat quia, velit illo eligendi id quis dolorem ab, nihil quisquam sunt, ipsam quasi hic
        pariatur? Odit eum nemo amet molestiae facere corporis error. Et, aut facilis ipsum at voluptatibus fugit sequi,
        vitae esse eveniet accusamus, tempore asperiores. Consectetur cum non ipsa ipsam illo architecto consequuntur
        odit voluptas adipisci assumenda corrupti dolore molestiae, saepe ducimus. In iusto accusamus iure velit, nobis
        consequuntur laudantium explicabo consectetur neque officiis. Odio dolorem nihil totam aliquid esse quae nulla
        porro natus minima maiores, similique labore laboriosam nesciunt nostrum optio. Consequuntur, dignissimos nam
        sit debitis nemo aspernatur dolores, suscipit cumque aut, deserunt accusantium optio! Vero porro, voluptatem
        pariatur delectus sint unde reiciendis labore hic quisquam quo, cumque voluptatibus earum ex voluptas soluta cum
        quia? Et non itaque deserunt alias voluptatum eligendi? Facilis aspernatur, tenetur quia assumenda, nostrum
        maxime impedit voluptate sint veniam consequatur nisi pariatur obcaecati expedita. Sed in, assumenda dolorum
        culpa eos at repudiandae optio. Maiores quam hic itaque dolor porro ratione, architecto eligendi! Beatae,
        provident pariatur qui rerum optio similique iusto in nisi corporis eius itaque molestias sit! Adipisci animi
        libero hic. Libero corporis neque id, suscipit inventore facere possimus fugiat accusantium sequi consectetur
        dolores voluptatibus quaerat odit sint ducimus nobis repellat tempora adipisci, necessitatibus asperiores est
        provident iste alias voluptates? Eos reiciendis magnam veritatis minima ab tempora, neque animi omnis voluptatem
        consequuntur, pariatur provident rerum voluptatum aliquid commodi doloremque iusto illum consectetur, maxime aut
        molestiae voluptatibus ut rem voluptate? Dolor debitis recusandae sequi sit consectetur, sunt, sed impedit
        temporibus pariatur nesciunt doloribus. Blanditiis, laboriosam corporis tenetur in ea repellendus perferendis
        inventore, consequatur error quae libero aperiam ut, placeat cupiditate sapiente ullam assumenda illo laudantium
        voluptate repudiandae. Cum ipsa praesentium fuga nostrum maiores commodi temporibus, tempora perspiciatis vero,
        illum quidem laudantium nobis dolores, excepturi earum eligendi? Aliquid id dolorum nostrum a impedit culpa,
        alias rerum possimus optio corporis voluptas. Odio sapiente facere accusantium at, molestiae quas soluta
        expedita nihil vero recusandae est, optio nisi ex corporis magni. Nihil vitae quia, illum corporis in id odio
        inventore ut cum exercitationem! Incidunt temporibus ipsam autem iste sequi mollitia, architecto quia, magni
        nulla obcaecati quaerat enim. Incidunt architecto dolorem commodi, sapiente placeat repudiandae eum cupiditate a
        rerum amet accusamus nisi ut. Eum odit ad adipisci qui impedit voluptas harum repellendus nisi dolores, omnis
        sapiente minus. Quisquam eius iure quod asperiores distinctio? Saepe alias quam ipsum, similique veniam quas
        quaerat ut dolor quasi vero doloremque a molestias? Enim, ducimus? Quibusdam vel quaerat facilis esse ea tenetur
        excepturi molestias ipsum ullam, praesentium nisi dolorum? Iste est sed facere harum cum nemo assumenda quod eos
        modi.
      </p>
      <VStack spacing="$4" alignItems="flex-start">
        <Menu>
          <MenuTrigger as={Button} rightIcon={<IconCrossCircle />}>
            Actions
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Download</MenuItem>
            <MenuItem>Create a Copy</MenuItem>
            <MenuItem>Mark as Draft</MenuItem>
            <MenuItem>Delete</MenuItem>
            <MenuItem disabled>Dave</MenuItem>
            <MenuItem>Didi</MenuItem>
            <MenuItem>Attend a Workshop</MenuItem>
          </MenuContent>
        </Menu>
      </VStack>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quasi provident excepturi minima itaque voluptatum
        cumque eos voluptas deserunt, corporis ex ipsum alias, eveniet voluptates molestiae illo quia voluptatem
        exercitationem? Eaque doloribus omnis repellat tempora culpa, debitis eos maiores dolor consequuntur error
        impedit eligendi alias. Assumenda quisquam asperiores delectus ducimus dolore quam veniam porro reiciendis
        soluta placeat, dolores omnis modi officiis dignissimos dolorem. Recusandae aliquam natus suscipit, unde
        voluptatum, harum itaque, rem aperiam quisquam tempore molestiae soluta tenetur. Ipsum sed molestiae autem neque
        labore nesciunt corporis beatae dolores repellendus placeat! Sapiente officia quam dolores quo ipsam dignissimos
        aspernatur expedita impedit aut, asperiores autem ipsum molestias cum aperiam provident eos? Eos fugiat
        asperiores voluptates id obcaecati delectus quia culpa soluta, eaque numquam magnam dolorum sit nostrum magni
        rerum ratione deleniti praesentium voluptatibus doloremque. Quam laboriosam quod quibusdam iure, officiis aut.
        Excepturi odit similique a. Porro, error doloribus obcaecati libero ipsam odio exercitationem! Quia quisquam
        odio voluptatum ipsum reiciendis reprehenderit fugit voluptas voluptate veritatis. Laboriosam consectetur
        placeat at esse possimus error quasi, id, ex dolorem iusto repellat voluptatum eos ipsum nihil impedit eligendi
        facilis aspernatur laudantium quod odio repellendus omnis est atque. Veritatis ad itaque repellendus, quibusdam
        recusandae eius magnam debitis accusantium laborum cumque? Quam alias sunt nihil eveniet error, corrupti
        exercitationem ex eos, totam neque perspiciatis. Laboriosam, nemo suscipit porro odio atque unde nesciunt
        doloribus id rerum iste! Perferendis ipsa voluptatibus unde libero itaque eos totam ducimus similique impedit
        quasi consequuntur eveniet quidem eius, nobis a, fugiat, doloribus sed. Consequatur atque nihil dolorum debitis,
        itaque eius, vitae totam qui exercitationem repellat reiciendis odit laudantium voluptates numquam. Quod libero
        est accusamus animi vel quasi laborum. Officiis tenetur alias sequi vel at aspernatur repudiandae, doloremque
        ipsum tempore, veritatis est quas voluptates magni necessitatibus, ab fugiat inventore excepturi fuga
        praesentium illo corrupti eligendi aliquid officia porro. Excepturi nihil itaque sunt voluptatem quae rerum rem,
        delectus illum eveniet quos non quo expedita quibusdam ratione ea unde laudantium commodi fugiat? Rerum tempora
        voluptates officiis consectetur provident fuga dolore, architecto hic assumenda eius at aperiam, adipisci
        cupiditate inventore porro eligendi illo. Dicta excepturi perferendis ipsam rem tenetur esse quisquam sunt. Sint
        expedita est reiciendis excepturi accusamus cumque, aspernatur, dignissimos ex rerum distinctio aperiam deserunt
        obcaecati autem ullam modi voluptatem officia debitis sit necessitatibus at minus vitae dicta voluptas
        architecto. Magnam sint voluptate nam similique odio sed, fugit molestias expedita officia quis ratione.
        Repudiandae harum maxime ducimus officia et eos architecto, voluptatum vitae minima cupiditate fugiat eius odio
        expedita corporis dolore unde pariatur in fugit. Doloremque amet atque dolorum perspiciatis sequi ab velit
        necessitatibus, at voluptatibus quaerat quas, quidem quam incidunt delectus. Alias animi vitae facere enim sed,
        ab rerum quia deserunt voluptatem nisi labore dolorum repudiandae porro! Ad dolorum dolor harum neque, porro
        amet, officia debitis repudiandae veritatis aliquam quam quidem magnam. Delectus, sunt! Voluptas quod iusto
        alias modi dolore exercitationem eos voluptatem quo. Cum odio laudantium, ipsam nam ducimus accusamus rerum
        porro tempore enim facilis, maxime quidem distinctio nobis voluptatum officiis. Pariatur nulla sint veritatis
        repudiandae accusantium nemo eius excepturi aspernatur dolorem ullam impedit voluptate quaerat distinctio sit,
        dolorum velit veniam! Minus modi quia voluptas perferendis, voluptates quis suscipit ipsam praesentium? Dicta
        voluptatem porro quaerat quisquam, architecto harum quia pariatur dolorum cumque accusantium iusto, itaque
        perspiciatis impedit a hic, error in? Illum inventore autem vel et quidem eligendi sint voluptates eveniet illo
        quas doloribus ea quisquam, aliquid ullam qui, ut doloremque aperiam, eius corrupti reiciendis deleniti enim
        error iusto! Quod quaerat quia, velit illo eligendi id quis dolorem ab, nihil quisquam sunt, ipsam quasi hic
        pariatur? Odit eum nemo amet molestiae facere corporis error. Et, aut facilis ipsum at voluptatibus fugit sequi,
        vitae esse eveniet accusamus, tempore asperiores. Consectetur cum non ipsa ipsam illo architecto consequuntur
        odit voluptas adipisci assumenda corrupti dolore molestiae, saepe ducimus. In iusto accusamus iure velit, nobis
        consequuntur laudantium explicabo consectetur neque officiis. Odio dolorem nihil totam aliquid esse quae nulla
        porro natus minima maiores, similique labore laboriosam nesciunt nostrum optio. Consequuntur, dignissimos nam
        sit debitis nemo aspernatur dolores, suscipit cumque aut, deserunt accusantium optio! Vero porro, voluptatem
        pariatur delectus sint unde reiciendis labore hic quisquam quo, cumque voluptatibus earum ex voluptas soluta cum
        quia? Et non itaque deserunt alias voluptatum eligendi? Facilis aspernatur, tenetur quia assumenda, nostrum
        maxime impedit voluptate sint veniam consequatur nisi pariatur obcaecati expedita. Sed in, assumenda dolorum
        culpa eos at repudiandae optio. Maiores quam hic itaque dolor porro ratione, architecto eligendi! Beatae,
        provident pariatur qui rerum optio similique iusto in nisi corporis eius itaque molestias sit! Adipisci animi
        libero hic. Libero corporis neque id, suscipit inventore facere possimus fugiat accusantium sequi consectetur
        dolores voluptatibus quaerat odit sint ducimus nobis repellat tempora adipisci, necessitatibus asperiores est
        provident iste alias voluptates? Eos reiciendis magnam veritatis minima ab tempora, neque animi omnis voluptatem
        consequuntur, pariatur provident rerum voluptatum aliquid commodi doloremque iusto illum consectetur, maxime aut
        molestiae voluptatibus ut rem voluptate? Dolor debitis recusandae sequi sit consectetur, sunt, sed impedit
        temporibus pariatur nesciunt doloribus. Blanditiis, laboriosam corporis tenetur in ea repellendus perferendis
        inventore, consequatur error quae libero aperiam ut, placeat cupiditate sapiente ullam assumenda illo laudantium
        voluptate repudiandae. Cum ipsa praesentium fuga nostrum maiores commodi temporibus, tempora perspiciatis vero,
        illum quidem laudantium nobis dolores, excepturi earum eligendi? Aliquid id dolorum nostrum a impedit culpa,
        alias rerum possimus optio corporis voluptas. Odio sapiente facere accusantium at, molestiae quas soluta
        expedita nihil vero recusandae est, optio nisi ex corporis magni. Nihil vitae quia, illum corporis in id odio
        inventore ut cum exercitationem! Incidunt temporibus ipsam autem iste sequi mollitia, architecto quia, magni
        nulla obcaecati quaerat enim. Incidunt architecto dolorem commodi, sapiente placeat repudiandae eum cupiditate a
        rerum amet accusamus nisi ut. Eum odit ad adipisci qui impedit voluptas harum repellendus nisi dolores, omnis
        sapiente minus. Quisquam eius iure quod asperiores distinctio? Saepe alias quam ipsum, similique veniam quas
        quaerat ut dolor quasi vero doloremque a molestias? Enim, ducimus? Quibusdam vel quaerat facilis esse ea tenetur
        excepturi molestias ipsum ullam, praesentium nisi dolorum? Iste est sed facere harum cum nemo assumenda quod eos
        modi.
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
