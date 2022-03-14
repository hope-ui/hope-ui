import "./playground.css";

import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  createDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  Input,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
      </HStack>
      <Button onClick={onOpen}>Open</Button>
      <Drawer opened={isOpen()} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <Input placeholder="Type here..." />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr="$3" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime ipsa numquam voluptatibus mollitia iusto saepe
        omnis dolore, unde consequatur. Odio rem nam nobis animi voluptate repudiandae nemo, cumque magnam error alias
        molestiae amet ipsam quisquam, dicta dolores? Vero beatae temporibus quia ad fugiat suscipit voluptatem labore
        sint. Sint suscipit obcaecati modi inventore aspernatur quam veniam laboriosam enim quibusdam accusantium nemo
        corrupti sed, facere ipsa optio libero doloremque? Ex qui pariatur rerum ratione harum cum voluptatum! In optio
        voluptatem accusantium temporibus delectus reiciendis culpa quaerat sed repellat minus! Asperiores fugit
        corporis beatae, doloremque a ad reiciendis inventore quos consequuntur dolor quisquam hic numquam distinctio
        veniam placeat, debitis ratione impedit in dolorum ullam mollitia repudiandae officiis. Dolorem illo,
        voluptatibus sequi nobis consequuntur labore cumque quos. Eos sed accusamus aspernatur voluptatem odio, rerum
        consectetur possimus soluta quia voluptatibus praesentium totam laudantium, laborum magni blanditiis quasi
        provident modi molestiae maxime nam reiciendis distinctio eius labore! Magni delectus odio accusamus aut commodi
        eligendi officia, tempore exercitationem architecto cupiditate a libero culpa non suscipit quisquam, maxime
        distinctio reiciendis. Hic placeat vero ab rem facilis porro in nulla dolore beatae quibusdam dolorem, maiores
        rerum voluptas debitis delectus, animi adipisci pariatur. Minus obcaecati non est. Dolorem distinctio illo qui
        autem optio! Ratione consectetur molestiae beatae ea reprehenderit repellat provident tempora officiis quam
        quia, itaque, animi laborum ad tempore deserunt veritatis impedit officia iure repudiandae quos explicabo ex
        assumenda ullam ipsam! Minus voluptas facilis odio nobis, quis reiciendis recusandae at. Placeat maiores modi
        dolore consequuntur laborum et rerum porro natus dignissimos earum voluptatum facere, quae officia veniam
        aliquid perferendis ipsam atque corporis, autem corrupti iste eveniet? Quos ipsam optio rem quisquam nemo
        exercitationem. Repellat tempore sapiente voluptate molestiae corporis, at nulla iste labore veniam aperiam sed
        neque minima illo omnis temporibus velit quidem cum ullam alias commodi. Provident architecto ex nemo a
        aspernatur fugit blanditiis quia dolorem quasi ipsum, impedit magni sed amet consequatur vitae dolorum alias
        tempora soluta. Nemo minima incidunt eligendi dolor nihil, cupiditate voluptatibus eius accusantium expedita,
        fugit distinctio consequatur quibusdam quidem est quos modi veritatis aliquid! Itaque pariatur incidunt modi
        iusto alias voluptas nostrum neque iure impedit quo consectetur ratione, maxime repudiandae labore, recusandae
        magni ea, laboriosam ipsam. Officia, vel! Corporis voluptas laudantium necessitatibus odio, magni libero
        perspiciatis magnam a exercitationem odit voluptates ipsa doloremque facilis porro quis fugiat delectus saepe
        reiciendis quisquam quidem, ea qui illo vero? Sit repellat sequi fugiat voluptatibus aperiam. Omnis itaque
        impedit nemo eaque distinctio dicta odio voluptas commodi eveniet similique, excepturi iusto explicabo eligendi
        iure! Explicabo nostrum, voluptatem quibusdam ea doloremque placeat nam quidem id. Voluptate, illo nemo sapiente
        cum voluptatum aperiam vitae fugiat doloremque veniam dolore neque maxime eveniet nesciunt odio reprehenderit
        illum ea recusandae veritatis quisquam corrupti eligendi ab sed? Non perspiciatis ullam mollitia odio. Culpa,
        adipisci harum. Suscipit quo maiores illum possimus nobis aspernatur quasi, assumenda facilis deleniti
        reprehenderit necessitatibus porro amet quisquam recusandae quidem quis culpa voluptatibus quod omnis eaque,
        totam modi ipsam quaerat! Iure, excepturi! Nesciunt consequatur eius aut accusamus itaque tempore reiciendis
        accusantium, harum illum natus voluptatibus voluptatem magnam placeat ex porro assumenda suscipit ut rem. Ipsa,
        quod quas delectus illum debitis quo, quaerat in eum distinctio obcaecati quae. Facilis voluptatibus tempore
        fuga soluta? Nesciunt, qui iusto facilis consectetur illo eos error! Et odio labore delectus incidunt
        consectetur repellat nisi optio, molestiae sunt alias recusandae accusantium? Praesentium odit, ex repellat
        eveniet voluptate debitis voluptatum ut asperiores. Vel odit facilis accusantium nesciunt asperiores voluptates,
        neque, illo nobis voluptatem voluptatibus in animi placeat, fuga ea debitis laboriosam possimus. Quos
        consequuntur maiores, asperiores saepe necessitatibus magnam vero sint, incidunt natus debitis ipsum cupiditate
        quis id numquam corporis placeat doloribus repellendus! Necessitatibus cupiditate sequi veritatis, delectus vel
        iure neque laudantium ea hic eius numquam optio facere debitis corrupti beatae amet quis libero magni? Dolorem
        eaque, reiciendis sed sequi minima molestiae laudantium tempora praesentium culpa, nemo deserunt consequatur,
        recusandae nihil nisi delectus ex quos quod doloremque eligendi velit laborum quibusdam quas. Exercitationem,
        tempora illo. Enim tempore unde, quos voluptatibus vel maxime sit beatae corrupti ullam blanditiis placeat ipsa
        suscipit consequuntur! Quia quasi voluptatem ab, consequatur, ipsa repellendus cum consequuntur optio tempore,
        repellat praesentium illo quo quis sed dolore excepturi perferendis! Ullam vel unde veritatis doloremque
        incidunt laborum sed nobis veniam non molestias minima fugit nostrum, ducimus aut eius alias! Ipsa pariatur
        laudantium molestias omnis doloribus adipisci voluptatibus alias quae, debitis, harum vel repellendus nihil
        magni ex beatae vitae commodi aut corrupti magnam tempora nisi odio porro consectetur perferendis? Provident
        consequuntur at, quam corporis, eligendi ea ad, similique quaerat quis magni expedita sed mollitia omnis. Quasi
        maxime reprehenderit facilis cum fugiat nulla et, aliquid repellendus mollitia. Earum sunt asperiores id placeat
        eligendi perspiciatis vero natus est iure culpa assumenda non debitis, maxime velit vitae dignissimos commodi
        aspernatur fugit minima maiores deleniti officia fugiat atque itaque! Excepturi dignissimos quae nihil
        repudiandae, praesentium id temporibus totam. Nemo aliquid qui quo. Assumenda qui accusantium saepe, soluta odio
        ipsa consequatur eveniet cupiditate molestiae similique odit adipisci fugiat amet nihil quo veniam quidem quam
        ratione aspernatur et, vero consectetur dolore repellat corrupti. Veniam in molestiae doloribus quis quaerat
        tempora cupiditate consequuntur error. Doloribus, error provident. Sit maxime, blanditiis, mollitia iusto
        ducimus velit asperiores explicabo fugiat dolore quam quibusdam perferendis cumque perspiciatis! Cum doloribus,
        labore sint sequi asperiores minus, delectus explicabo quo repudiandae, consectetur similique dicta eos ipsam
        at. Quaerat voluptatum tempore beatae illum odio possimus eius sit commodi, exercitationem quidem veritatis ea
        ad, dolor quod! Porro ipsam consequatur doloremque. Cumque consequuntur distinctio quos doloribus error alias
        quam molestiae! Dolorum, facilis in. Nemo, autem commodi modi repudiandae repellendus totam nobis unde
        laudantium numquam! Ratione, autem id! Nam eveniet obcaecati expedita quis cum. Quo exercitationem suscipit,
        eius rerum dolorem unde iusto est necessitatibus eveniet. Repudiandae hic omnis architecto modi iste laudantium
        dolores facilis ducimus sunt? Atque iste expedita odio quibusdam. Minus, tenetur dolor tempora a voluptatum
        inventore exercitationem asperiores necessitatibus distinctio, velit alias eaque corporis doloremque natus atque
        in numquam. Odit dolore rerum nam maxime, similique distinctio ad eius vitae eveniet ipsum deleniti eos quia
        omnis aperiam cumque reprehenderit a culpa cupiditate iusto, laborum vero! Adipisci culpa sunt commodi, enim
        animi molestias accusamus! Delectus corrupti reiciendis non! Odit ipsam exercitationem neque, repudiandae maxime
        fugiat sapiente laborum omnis voluptas voluptate quas voluptatum architecto est soluta quae voluptatibus earum,
        eum alias debitis qui itaque consequatur consequuntur ullam! Repudiandae necessitatibus fuga ex ad repellendus
        nobis id nulla sint praesentium sequi maxime eveniet consectetur iste ab, similique nesciunt dolore inventore
        dolores ea a vitae voluptatibus. Quis, necessitatibus neque quidem omnis quia perspiciatis recusandae deleniti
        eos sed enim dolore consequatur, aliquam nulla esse in eius quasi architecto voluptates vitae laborum sequi!
        Earum delectus, recusandae nesciunt vitae nobis aut officiis exercitationem ut, voluptates reprehenderit iure
        minima voluptatum. Optio eveniet, tempora delectus dolor quas ipsa nesciunt atque iste, quis repellendus, beatae
        eum! Dignissimos, distinctio tempore repellat quisquam asperiores, explicabo dolore maiores dolorem ea vero
        voluptates adipisci. Eligendi enim ullam velit est corporis, placeat ipsum veniam laborum magni! Perspiciatis
        laboriosam nulla sit omnis. Neque praesentium esse numquam, repellat odit architecto! Temporibus quidem nostrum
        provident nemo recusandae incidunt doloremque ipsa repellendus. Odio dignissimos rerum eligendi quas laudantium
        sint in ducimus! Dignissimos quidem ipsam eos? Voluptatibus quis perferendis itaque sint ipsum ipsam nemo
        quisquam aliquam nulla, voluptate rem dolorem provident sed optio, voluptates deleniti nobis non ut dolor
        mollitia porro enim sunt corporis. Eaque at facere vero maiores. Voluptate ea quia aliquam obcaecati amet est
        vel consequatur perspiciatis deleniti soluta adipisci facilis rerum quo dolorum aspernatur sapiente quasi
        dolorem numquam quas, facere tempore, expedita nobis labore! Placeat qui sint earum aliquam, molestias delectus
        voluptatum a aut, aperiam, ipsam incidunt ullam veniam dolore nihil eius architecto nulla quasi? Cupiditate, et
        deserunt. Magni numquam totam delectus distinctio quae. Iure quasi numquam hic quaerat dolor dolore culpa rerum
        vel officia doloribus aperiam eaque sint asperiores ipsum magni, nisi, et facilis consequuntur. Fugit, sint?
        Neque perspiciatis repellat eius minus incidunt ducimus commodi reprehenderit ut nobis officiis distinctio
        deleniti nesciunt inventore, esse labore repellendus laboriosam doloribus sequi aliquam cum sapiente ipsam
        tenetur? Maiores, quibusdam minus doloremque ad adipisci autem dicta molestiae excepturi tenetur error obcaecati
        reiciendis nisi quae nemo dolorem, ducimus quod beatae inventore ipsa illo velit et quos. Fuga commodi
        repellendus nihil perferendis, porro dicta mollitia modi, tenetur quo vel corporis nesciunt explicabo obcaecati?
        Odio deleniti sint nostrum! Nesciunt sequi voluptatum vitae. Repellat, reiciendis. Vero neque quo nemo sed nisi
        aut id omnis odit tenetur amet. Libero officiis, dolores fuga in saepe cum, quisquam vero consectetur optio
        dolorum repellendus nisi. Rem nemo aut, quos aspernatur optio recusandae at soluta iste eos vel natus neque
        minus porro, vitae ullam suscipit numquam totam. Doloremque voluptatum fugiat iste quo nostrum illo?
        Reprehenderit ipsam quo placeat a natus inventore cupiditate impedit eaque animi, consequatur id, amet repellat
        sunt perspiciatis similique ad laboriosam aliquid nihil aut quis alias ab blanditiis quaerat! Veniam nostrum aut
        voluptates at sed architecto laudantium necessitatibus qui? Totam cupiditate alias ipsa minus similique, modi
        tempora quas aspernatur, molestias dolorum praesentium blanditiis minima eligendi voluptatem corrupti, porro et
        quaerat? Modi quo quia consequatur. Excepturi numquam est officiis saepe! Numquam, temporibus. Consequuntur
        inventore dolor, quisquam officiis nihil sunt quos doloribus consequatur vel architecto accusamus praesentium,
        cumque, nobis quam dolorem. Vitae, eius. Vel ad hic, error quia, esse exercitationem tempora nemo eaque amet
        nesciunt voluptas. Officiis impedit quos voluptates ducimus. Sequi, harum itaque? Aliquid inventore, voluptatem
        labore cupiditate, libero quibusdam necessitatibus animi totam provident fuga quidem consectetur consequuntur
        consequatur dolorem neque quam dolor? Quis neque atque, ipsam deleniti dolorem voluptatum voluptatibus unde fuga
        quisquam quidem tenetur sequi accusamus ad saepe. Ipsa molestias vitae veritatis maxime earum nam explicabo
        minus. Recusandae eveniet, possimus quasi facere eaque, magnam placeat quidem dolorem hic officia modi inventore
        mollitia praesentium, quos quisquam voluptate. Velit sit recusandae dignissimos ab voluptas ipsam dolorum
        nostrum doloremque pariatur impedit, magnam esse tempora voluptatum nisi saepe? Nam molestias perferendis
        possimus consectetur esse consequuntur ipsa excepturi ducimus! Aliquid nam ex quaerat laboriosam, iure maiores
        rerum numquam repellendus consequatur beatae omnis, doloremque unde fugit. Quidem accusamus veritatis voluptate
        atque! Nihil ex dolorum sapiente praesentium repellendus molestiae labore, nisi soluta tempora saepe porro iure
        fugit ratione quod libero obcaecati quae possimus dolorem magni maxime provident. Illo laborum quod quam impedit
        iure suscipit illum saepe eveniet minima magni voluptate, corrupti sunt similique praesentium perspiciatis
        harum, delectus sapiente consequatur, expedita ullam eos fuga assumenda esse quae? Beatae, doloribus? Laborum
        amet mollitia nobis enim vel, accusantium vero architecto distinctio rerum doloribus explicabo quod est voluptas
        aliquid ad reprehenderit odit, obcaecati et? Dolore aliquam amet, commodi tenetur veniam itaque soluta esse.
        Tenetur esse officiis expedita, illo natus molestias iste nostrum vel eligendi consectetur temporibus animi nam
        repellendus quod quidem cum modi sit, porro quas aliquid? Voluptates est consequatur illo, autem enim iusto
        voluptatum, iure consectetur cum quo animi numquam et impedit excepturi assumenda voluptatem ratione at
        cupiditate ab! Modi dolorum eius fugiat quam hic, quis eos perspiciatis debitis enim, iure sed unde cupiditate
        suscipit? Est vero quas distinctio iure nesciunt, voluptatem id magnam ducimus officia, neque quibusdam
        accusamus. Incidunt veniam dolores quos eveniet omnis quaerat! Unde cum dolorum delectus rem veritatis
        repellendus vero! Architecto, consectetur accusantium atque sed facere suscipit dolorum earum quae obcaecati
        unde, id quaerat adipisci sapiente illum optio quibusdam iusto eos itaque odio consequuntur accusamus
        perferendis possimus quasi. Sint quidem iste nulla maxime quia sapiente neque repellat corrupti consequuntur,
        voluptates tenetur nesciunt ipsam laudantium maiores labore, earum nam cum quam, veritatis ipsum assumenda at
        nisi ullam. Odit culpa nam corrupti, at veniam officia neque non repellat error dolorem quas, tenetur, ab
        quisquam consectetur ipsum sint accusantium. Laborum adipisci et aperiam cumque, nostrum amet eaque accusamus
        reiciendis omnis. Dolorum libero exercitationem harum soluta vel qui consectetur, optio veritatis sunt, alias
        natus ipsum consequuntur voluptatem ipsam fuga aut saepe eos velit unde inventore molestiae omnis dolorem?
        Perspiciatis neque corrupti rem quisquam incidunt quae quasi exercitationem. Repellendus et libero in tenetur
        sed. Voluptatum vero modi qui eum asperiores a nam impedit enim molestiae mollitia nulla officiis et,
        architecto, aperiam ullam ea temporibus fuga assumenda culpa at iste omnis. Vitae, iste reprehenderit?
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
