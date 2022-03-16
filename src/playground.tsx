import "./playground.css";

import { For } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  createDisclosure,
  FormControl,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SelectContent,
  SelectListbox,
  SelectOptGroup,
  SelectOption,
  SelectTrigger,
  useColorMode,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <Select placeholder="Choose wisely">
        <SelectTrigger maxW="300px" />
        <SelectContent>
          <SelectListbox>
            <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
              {item => <SelectOption value={item}>{item}</SelectOption>}
            </For>
          </SelectListbox>
        </SelectContent>
      </Select>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Create your account</ModalHeader>
          <ModalBody>
            <FormControl id="firstname" mb="$4">
              <FormLabel>First name</FormLabel>
              <Input variant="filled" placeholder="First name" />
            </FormControl>
            <FormControl id="lastname">
              <FormLabel>Last name</FormLabel>
              <Input variant="filled" placeholder="Last name" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus amet quisquam itaque quas porro mollitia
        dolore doloribus quos libero provident, enim praesentium quam consectetur tenetur debitis fuga officia
        voluptates adipisci ad sit. Autem ad totam libero iusto temporibus id, deleniti distinctio non fugit culpa hic
        ullam vel quis perspiciatis saepe quam voluptates quasi ducimus neque dicta eos in nisi! Exercitationem
        explicabo ea laudantium saepe ducimus cumque, sint ipsam dolor facere animi. Earum, cupiditate possimus et vel
        repudiandae neque dolorum consequuntur voluptatibus aspernatur, quo, nisi obcaecati odio architecto. Quisquam
        quasi quidem nemo distinctio earum id aut corrupti delectus tenetur, debitis autem praesentium. Sit sed minima
        cupiditate corrupti aliquam totam quae excepturi quam at tempore delectus, molestias ullam a, impedit illo
        voluptate laborum eum dolorem cumque? Repellendus repudiandae accusantium delectus totam, obcaecati nostrum
        fugit, porro, explicabo sed nihil nisi reiciendis eum necessitatibus! Eum dolorem ex nobis sint placeat odit qui
        labore facilis id tenetur, quis sapiente unde nam aliquam soluta, temporibus nisi voluptas libero! Deserunt,
        facilis inventore dicta natus voluptatum eius at laudantium non. Dolores, deserunt. Repudiandae optio enim sequi
        accusantium ratione hic unde eaque maxime ducimus porro consequatur ad, minus facilis ipsa corrupti expedita at
        error dolores voluptas odit, ullam perspiciatis, laborum cumque. Similique id qui tenetur ducimus maiores.
        Corrupti, nisi quos illum consequuntur quisquam modi minus inventore quasi fugiat ipsam vero fuga quas excepturi
        dolor explicabo sint, dignissimos esse veniam ducimus earum? Debitis, eveniet? Architecto soluta commodi numquam
        tempore consequuntur eos possimus labore sunt pariatur voluptatum? Hic dolor voluptas totam dolorum eum
        doloribus quas nihil eos nemo! Tempore debitis earum dolorum in distinctio dignissimos, temporibus cum
        repudiandae quae quod minus minima, odio facere nisi est possimus libero! Corrupti quas ipsa, delectus, dolorem,
        qui autem debitis quis at quo recusandae aspernatur animi voluptas aliquid culpa quam odit odio tenetur optio
        reprehenderit explicabo fugit nam aut numquam quisquam. Atque commodi quis quo omnis ipsam, recusandae minima
        ipsa obcaecati sit optio. Quia ad ullam culpa corrupti dicta eveniet recusandae placeat! Asperiores praesentium
        molestias dolores, minima repellendus cupiditate eius recusandae ex illum ab maiores quo dicta, delectus velit
        hic eveniet quisquam necessitatibus odio nulla iusto quaerat, aut provident saepe. Dignissimos suscipit dolor
        ullam deserunt quam maiores ipsum esse. Enim ipsa suscipit est expedita fuga voluptatibus architecto atque
        voluptas, non reiciendis? Sapiente dolore est, ad atque mollitia commodi possimus et nisi incidunt eius
        provident numquam nemo architecto illum dolorum laudantium unde labore, magnam perspiciatis aut? Ipsa incidunt
        numquam quidem explicabo nulla pariatur, maxime alias dolorum optio nisi labore eos repellat quos dolorem
        recusandae nobis magni eius deleniti facilis tempore accusantium! Sunt quia, sequi facere ex sapiente
        repudiandae? Quia, dolorum dolorem deleniti, quas ipsam voluptas perspiciatis ullam aperiam mollitia incidunt
        molestiae. Incidunt eius vel corrupti placeat ea pariatur ratione, ipsam consectetur quidem obcaecati, veniam
        quasi quos quo sunt, corporis facere. Quo qui nobis, dolor pariatur nostrum nemo ratione, distinctio, expedita
        id ullam mollitia. Iste adipisci, sint fuga harum ad doloremque? Iusto vel nihil neque dolores? Nulla inventore
        voluptatem tenetur ullam itaque sunt perferendis excepturi adipisci hic, odit odio reiciendis modi cumque veniam
        ducimus, libero sequi, quasi eaque sit officiis porro atque eveniet. Deleniti doloribus impedit maiores, nulla
        nostrum cumque, eum, optio ullam quasi maxime pariatur animi odit laboriosam quos nam ipsam sunt. Cumque,
        maiores, officia quis accusantium doloribus recusandae iste natus consequuntur rerum mollitia ipsam corrupti
        eius veniam? Nam, maiores? Quibusdam, voluptatum iure? Corporis, deserunt explicabo iste eligendi velit
        perspiciatis qui veniam repellendus beatae accusantium consequuntur incidunt aspernatur nesciunt quisquam id
        maxime molestiae quos asperiores tempora, ex sint, delectus nostrum. Magni tenetur cum numquam cumque corporis
        illum facere nihil. Doloremque quidem voluptas perferendis quasi eum harum accusamus corporis neque ipsam
        libero, unde consequuntur sequi tempore, error quos! Ipsum voluptate eos pariatur veritatis rem atque velit
        aliquam odio enim quibusdam vitae sint illum debitis rerum dolorem vel numquam fugiat dolores quisquam, maxime
        quaerat. Odit vitae, laboriosam neque provident ipsa nihil quisquam asperiores culpa repellat, perspiciatis
        deleniti fuga harum debitis, quibusdam mollitia at autem magnam accusamus quis dolorum ex laudantium sunt!
        Veritatis eius deserunt numquam magni dicta? Excepturi laudantium dignissimos, rerum aperiam est error omnis
        tenetur itaque similique. Exercitationem unde nam qui earum, aut quae blanditiis illum repudiandae iste.
        Voluptate quae omnis, consequuntur alias aliquam facilis cupiditate non provident vel delectus unde atque, ad
        obcaecati! Illo labore repellat ducimus non culpa deleniti quasi, sit fugit ab? Modi atque exercitationem quas!
        Repellat sit quae itaque, vitae dolores et possimus maxime perferendis, ea fugiat officia eum tempora cupiditate
        at eos quisquam numquam adipisci ducimus iusto veritatis ipsam hic! Vero distinctio odio nostrum libero sapiente
        quae in consequuntur id unde quo quis odit assumenda facere accusantium corporis, sint debitis iste dolore
        totam. Sed ipsa quaerat quam? Pariatur corporis sequi aliquid enim voluptatem, veritatis accusantium, obcaecati
        vero hic ad quia nemo cum recusandae alias harum in necessitatibus voluptas soluta eius reprehenderit est
        molestias exercitationem. Nemo nam ratione porro dignissimos consequatur dolores ex sequi cupiditate unde.
        Doloremque repellat voluptates iure minima suscipit eius, neque at facere. Facere, esse asperiores. Aperiam
        ipsum sit iste suscipit consectetur, sed soluta sapiente, tempore esse laudantium voluptatem veniam, dicta
        rerum. Harum repellendus id, culpa, eligendi laboriosam quaerat quas rem quibusdam ad quos vel dolorum
        dignissimos in ratione laborum eos? Sapiente iure eius minus deserunt quaerat dolore similique ratione aliquam
        at? Molestiae quidem repudiandae dolor! Recusandae aut dignissimos, magnam, id sed est maxime quod saepe laborum
        laudantium unde vero perferendis obcaecati maiores quidem sapiente. Voluptatem dolorem, sapiente facilis ut
        eveniet voluptate in dicta ex excepturi recusandae doloremque incidunt placeat perferendis voluptates. Ea
        architecto obcaecati corrupti totam officia dolorum, deserunt inventore accusantium, suscipit cupiditate sequi
        odit, ad nulla. Commodi temporibus facere laborum, dicta rerum est veritatis, aliquid ex libero, consequuntur
        alias dolore suscipit. Animi quasi expedita itaque ipsum iste molestias, quaerat, dolores dolorum exercitationem
        voluptates iusto ipsam eius nam quam nisi illum fugiat cumque voluptate beatae doloremque repellendus nulla
        facere! A incidunt illo sint vitae quisquam quod, earum vel adipisci velit explicabo quam. Ullam, nemo qui
        maiores soluta sed fugit obcaecati cupiditate optio officia est dolore amet ad? Labore laborum distinctio eos
        totam ab. Laudantium fugit eos ratione quidem quisquam doloribus quis, architecto sit eaque repudiandae alias
        dicta quos magnam omnis tempore vel distinctio est eum maxime quas nam dolorem sunt nihil error? Nihil natus
        alias eaque aliquid, cumque, illo sint numquam enim odio praesentium obcaecati maiores totam, fugiat sit ad
        nulla illum quod unde modi corrupti pariatur! Magnam quibusdam sapiente veniam, perspiciatis, alias earum minima
        numquam ipsam blanditiis, nam consequatur sint! Quae, nobis atque. Officiis tenetur placeat ipsum fugiat
        blanditiis nulla minus nihil voluptas sapiente mollitia dolores omnis natus tempore a quaerat libero magni,
        atque harum eaque praesentium ab tempora eligendi! Reprehenderit a officiis temporibus fugiat saepe, repudiandae
        deleniti sequi id exercitationem. Sequi voluptatum, magnam perferendis atque reprehenderit necessitatibus nisi
        tenetur deleniti non inventore, quis cupiditate eveniet illum fugiat possimus. Quis fugit laborum, nam veniam
        eum neque aut alias repudiandae et natus voluptate soluta quidem deserunt, esse dolores numquam eveniet
        blanditiis cupiditate! Blanditiis esse animi exercitationem doloremque quasi, quae a cupiditate nostrum cumque
        laborum, doloribus quibusdam laboriosam maiores vel velit voluptate, accusantium pariatur atque. Nulla excepturi
        minima voluptas facere molestiae veritatis ea saepe, in blanditiis ut, minus corporis cumque. Vel sint harum
        eius asperiores eum officia, aperiam fuga expedita earum. Asperiores eius aperiam perspiciatis doloribus in
        beatae molestias commodi labore eum nam veritatis adipisci, odit, numquam illo dicta consectetur ducimus
        expedita placeat facere nesciunt modi, sed culpa? Error eos corporis exercitationem aspernatur ipsa dolores quam
        ducimus, suscipit ipsam harum minus corrupti excepturi tenetur placeat, praesentium commodi. Cum amet molestiae
        unde nisi doloribus necessitatibus illum dolorem illo saepe adipisci molestias sit excepturi, sed culpa ex
        placeat aperiam at tenetur corporis assumenda omnis consequuntur, porro impedit. Fugit, dolorem. Similique eaque
        quis fugit voluptatem quos, facilis aliquam voluptatum consequatur, odio deleniti omnis possimus unde magnam
        laudantium quod temporibus dicta. Cum iusto aperiam adipisci vitae. Aspernatur non ipsum nisi cum quas?
        Repellendus autem nostrum deserunt, facere dolorem aspernatur rem maiores, voluptatem similique quo quos fugiat
        dolor eaque. Alias expedita libero quo, quia esse dolores officia facilis sapiente! Explicabo laborum ad
        dolorum, sapiente laudantium optio assumenda quidem at esse magnam sed distinctio quo dolor suscipit delectus
        maxime quos sint pariatur consequuntur reprehenderit eligendi. Omnis illo aliquid nisi voluptate quae provident
        unde, aspernatur qui dolores rerum cumque impedit repellat sed, voluptatum tenetur minus numquam minima veniam
        dolore facere. Perspiciatis vel minima inventore voluptates excepturi velit error qui accusantium consectetur,
        quas ducimus sit porro necessitatibus, ipsum illum vero. Omnis, voluptates! Nihil magni earum at consectetur
        impedit voluptas cupiditate delectus ratione sit nam a quo rem, repellat eveniet dolorum tempora? Atque animi,
        facilis quae tempore temporibus modi harum, fuga doloremque error architecto perspiciatis. Labore id accusamus,
        temporibus quidem repellendus praesentium non cupiditate aspernatur eligendi quae nostrum minus incidunt
        ducimus! A dolorem praesentium autem, voluptates quidem, magni similique qui sunt non dolor eaque laborum
        aperiam possimus voluptatibus quas libero tenetur eum! Quas suscipit a neque quaerat maiores similique facilis
        error, nobis amet eius sequi dicta deleniti magni corporis. Quo minus deserunt, maxime qui esse quasi ab
        consectetur vero laudantium odio exercitationem reiciendis molestias saepe illo explicabo, ratione dolorem
        eveniet magni voluptatem, facere amet debitis repellendus! Ullam nemo vero, commodi molestiae sapiente
        dignissimos in fugiat nihil autem eligendi odio cupiditate laboriosam illo eius rerum ut obcaecati saepe non
        officiis! Sed soluta numquam vel, corporis necessitatibus itaque facere doloremque corrupti? Cupiditate id
        officia sed quidem repellat ipsa. Nobis, laudantium reprehenderit. Unde, ad molestiae illo cupiditate nisi non
        praesentium repellendus aspernatur cum! Reprehenderit veniam deserunt odit reiciendis explicabo quisquam quis
        doloribus maiores eaque consequuntur sit quidem tenetur alias minus, nesciunt ut, sequi culpa impedit fugit
        eveniet! Doloremque dolor, vel modi eligendi labore hic sapiente debitis magnam nesciunt libero! Aliquid
        suscipit fugit culpa ducimus vero eos, eligendi, maxime quod, molestias debitis cumque eveniet eum corporis ex?
        Amet officia corporis, unde in tenetur odio perferendis illo totam voluptate dolor. Doloribus nobis asperiores,
        dicta corporis inventore, incidunt veniam necessitatibus, odio deserunt eveniet ab ipsa enim maiores. Nemo ipsa
        reiciendis dicta aliquid, est voluptatibus voluptates sunt nam, ex perferendis consectetur quisquam, eveniet
        similique consequuntur enim amet quaerat. Odio libero blanditiis accusamus quibusdam quos, mollitia fugiat
        tempora, dicta asperiores vero corporis est maxime nam dolorem nulla inventore iste sint et labore temporibus
        fugit corrupti. Vero accusantium consequuntur minus recusandae amet quisquam pariatur ipsa et expedita, qui sit
        in placeat omnis culpa fuga, veniam natus mollitia cum saepe! Dolor ut dolorem eligendi cum non sunt facere et.
        Magnam consequatur dignissimos dolor placeat ipsa illum quibusdam quia sed aut dolorem, perferendis temporibus
        totam eum vero quam dolorum? Molestias tempore assumenda cumque distinctio fugit accusantium itaque saepe iure
        maiores totam placeat reiciendis a aut commodi impedit debitis nam ex eius quos voluptatem, eligendi laborum.
        Ratione dolores corrupti eum nulla ipsa architecto aut. Necessitatibus delectus, voluptate maxime architecto
        dolores eaque nemo, cum veritatis hic laborum ipsum temporibus facilis at repellendus pariatur quam voluptates
        culpa molestiae. Illo repellat possimus esse, illum, nisi eaque perferendis vero soluta quaerat molestiae quas
        veniam tenetur in exercitationem excepturi alias aliquam error. Ratione perspiciatis vel consequuntur quibusdam
        non saepe laborum repellendus reiciendis omnis? Quam hic, vero, fugiat nostrum iste sit nesciunt corporis
        praesentium eaque rem optio veritatis ut! Odio quas asperiores cumque eligendi, facilis inventore voluptatem
        possimus. Culpa perspiciatis excepturi itaque quam nulla, nostrum nobis magnam eaque quasi dolore cum esse,
        reiciendis eius aperiam velit ullam. Qui odit, hic consectetur vero non error temporibus quo aspernatur adipisci
        ex rerum corrupti, officiis natus. Libero, asperiores velit, dicta voluptate fuga deserunt maxime ratione nihil
        minus aut, tenetur sapiente eius eum! Ut vero, officiis qui asperiores dolor amet voluptates odio minima. Quia
        officiis saepe quaerat ratione maxime aliquam optio reprehenderit inventore, sed distinctio assumenda. Officiis
        saepe in animi eum nostrum excepturi aliquid laudantium? Tempore, pariatur soluta? Quibusdam eius vel excepturi
        itaque in dolores, similique et. Harum odio, ab nam dolorem fuga repellat ullam adipisci, sapiente officiis
        explicabo esse ducimus, nemo amet? Doloribus temporibus, laborum rem quis omnis vel nemo totam ipsam. Nam magnam
        exercitationem molestias iure explicabo rerum iste perspiciatis, incidunt tempora repellat quo cum dolores
        molestiae fuga eius.
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
