import { createDisclosure } from "@hope-ui/primitives";

import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerDescription,
  DrawerHeading,
  DrawerOverlay,
  HStack,
  VStack,
} from "../src";

export default function App() {
  const { isOpen, open, close } = createDisclosure();

  return (
    <>
      <Button onClick={open}>Open Drawer</Button>
      <Drawer isOpen={isOpen()} onClose={close} size="full">
        <DrawerOverlay />
        <DrawerContent p={4}>
          <HStack justifyContent="space-between" alignItems="flex-start" mb={4}>
            <VStack alignItems="flex-start">
              <DrawerHeading fontWeight="semibold">Drawer Title</DrawerHeading>
              <DrawerDescription
                fontSize="sm"
                color={{ light: "neutral.600", dark: "neutral.300" }}
              >
                Drawer Description
              </DrawerDescription>
            </VStack>
            <DrawerCloseButton />
          </HStack>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi architecto atque beatae
            dicta dolorum, ea esse ipsa, ipsam magnam magni maiores nostrum nulla odit quasi ratione
            sed sequi similique soluta suscipit veniam! Delectus dicta dolore eos quas tenetur?
            Accusamus accusantium, consequatur ducimus, harum mollitia natus nobis quia quo
            recusandae sit soluta vero voluptate voluptatum! Assumenda commodi, consectetur ea
            exercitationem natus omnis vitae! Animi dolore eum eveniet inventore perferendis
            repellat sint sit tempora vel voluptatem. Aut debitis, enim maiores nesciunt obcaecati
            quos ratione recusandae vel. A accusamus asperiores consectetur deserunt enim esse et
            exercitationem laborum non numquam sint, sit sunt suscipit.
          </p>
          <button data-autofocus>First</button>
        </DrawerContent>
      </Drawer>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. A aperiam deserunt ea, eaque, eum
        expedita fuga incidunt inventore ipsum iste libero minima natus neque non odio omnis
        pariatur quis reiciendis repellat sapiente sequi temporibus voluptates voluptatum! Enim,
        repudiandae sed. Animi asperiores at corporis debitis deserunt ea enim error facere harum
        ipsum iusto minus molestiae nemo neque numquam omnis perspiciatis quae quaerat quam rem
        reprehenderit sed suscipit ut vero, vitae voluptatem voluptatum. A alias animi aut
        doloremque et eveniet exercitationem fugit ipsa iure laudantium magni minus natus nemo
        numquam, obcaecati optio placeat possimus praesentium quae quibusdam quisquam quos rem
        tenetur totam veritatis. Aperiam delectus eaque fuga fugiat, minima pariatur quia reiciendis
        sit temporibus totam? Adipisci alias autem consequatur delectus ex, fuga illum iusto natus
        nihil nobis obcaecati omnis provident quaerat quia quisquam quo sapiente velit voluptate! Ab
        autem beatae cum dolore dolores dolorum ducimus eaque eius esse eveniet harum hic id impedit
        iusto laudantium libero minus necessitatibus non nostrum odio odit, officia quisquam
        recusandae repellat sunt veniam voluptas. Amet at consectetur culpa cum dicta error
        excepturi fugit hic id maxime minima, modi omnis quae quas rem sequi voluptatibus?
        Accusantium dolore fugit ipsam nemo nisi provident quia, quis repellat veniam! Deleniti eius
        facilis fugiat, odio officia saepe voluptatibus! Accusamus, inventore minus nihil non quae
        quis reiciendis veritatis. Accusantium ad blanditiis excepturi laborum minus nesciunt non
        qui, quia quisquam, repellat reprehenderit tenetur? Accusantium aliquid amet aperiam
        asperiores, assumenda beatae commodi dolorum ea eaque eos error facere harum illo ipsum
        itaque laborum, magni maiores minus necessitatibus nemo nihil odio officiis placeat porro
        quam quibusdam quos ratione reprehenderit saepe sed similique soluta voluptates, voluptatum.
        Assumenda deserunt error excepturi impedit provident repudiandae. Aliquam assumenda, at
        beatae cupiditate deleniti distinctio dolor et eveniet exercitationem hic impedit in ipsam
        iure labore laborum libero magnam maxime minus neque nostrum obcaecati odio quas repellat
        repellendus reprehenderit saepe vitae. Accusantium dolores, ea ex facilis quos rerum sed!
        Aperiam illo, incidunt iste maiores maxime natus optio reiciendis. A aliquam aperiam
        asperiores at consectetur delectus dolore dolores earum, eos esse, et ex ipsam iste laborum
        minima natus nostrum obcaecati, porro quod rem repellendus rerum saepe temporibus velit
        vero! Ad autem consectetur dolorum earum eum excepturi, impedit inventore nam nisi nobis
        odit officiis optio placeat quasi quisquam quos recusandae soluta! Accusantium commodi
        corporis delectus deserunt dolorem eius eos ex fugiat libero maxime minus nam officiis,
        placeat quaerat ratione temporibus vero voluptatum. Aperiam consectetur cum dolore ea enim
        exercitationem expedita harum, ipsa labore laborum magni maiores maxime minus necessitatibus
        nobis numquam odio pariatur provident quia quidem quisquam reiciendis rem repellat unde
        veritatis vitae, voluptatum? Accusantium adipisci, aliquam commodi cumque debitis,
        distinctio doloribus earum ex exercitationem, impedit iste nemo placeat quod repellat
        repudiandae sequi sint tempore unde ut vitae. Nam, necessitatibus, sunt. A ab blanditiis
        consectetur deleniti distinctio dolore, doloremque dolores ducimus eius est eum excepturi
        fugiat fugit impedit iusto laudantium magni maiores modi mollitia nemo nihil officia
        officiis, praesentium quae quidem repudiandae saepe tempore veniam voluptatem voluptatum?
        Adipisci asperiores dolor esse optio provident ratione reiciendis. Aperiam assumenda,
        delectus eum harum impedit optio placeat possimus quo unde? Ad alias aspernatur, atque autem
        consequatur cupiditate debitis dolores esse excepturi exercitationem fuga fugit ipsum libero
        minima molestiae necessitatibus, neque officia perspiciatis, quo recusandae saepe sed
        similique tenetur unde vero vitae voluptatibus. Atque dolorem iste maiores modi quos ratione
        sapiente vel. Accusamus amet aut blanditiis dignissimos dolores, earum est ex harum illum
        impedit incidunt ipsa minima minus molestiae necessitatibus nesciunt nostrum nulla officia
        perferendis perspiciatis placeat quibusdam quidem quos repellat rerum sed sunt tempore,
        totam ullam vel veniam vero voluptates, voluptatibus? Autem culpa facilis molestiae quaerat
        quam. Aliquid aperiam atque, dolorem doloremque dolores ea enim laboriosam laborum magni
        molestias nam nesciunt nisi nobis nostrum nulla obcaecati optio pariatur praesentium quia
        quo totam ut veritatis! Ab asperiores aspernatur commodi consectetur culpa, dicta earum
        eveniet excepturi explicabo facere illo ipsam, laborum magni maiores molestiae non numquam
        obcaecati qui quia reiciendis tempora, totam velit veniam. Ad animi autem blanditiis
        consectetur consequuntur dolorem dolores ea est, et expedita explicabo facere fugiat hic
        itaque minima minus molestias mollitia nemo odio possimus praesentium quas quia quos rerum
        saepe sed tempora tempore temporibus totam unde veniam veritatis voluptas voluptate!
        Aspernatur aut beatae culpa dolore dolores facere fuga id impedit iste iure laboriosam
        necessitatibus nisi non nostrum quaerat quibusdam quod, similique, sunt voluptates
        voluptatibus. Alias aspernatur earum ex ipsa maxime rem temporibus. Accusamus cumque eos
        error eum eveniet iste itaque labore, laboriosam magnam maiores molestiae officiis optio
        praesentium, provident qui, sed voluptatem. Atque iusto libero minus quia quibusdam! A
        accusantium, at beatae deleniti dolorem ea eum fugiat hic illo, nisi nostrum obcaecati,
        porro quis quod sequi. Atque autem consequatur consequuntur esse fuga impedit iste modi
        mollitia nemo neque obcaecati officia qui soluta, suscipit, ut vitae voluptate? Cumque
        dolorum est labore nesciunt officiis provident reiciendis sequi suscipit voluptates.
        Consequatur deserunt iusto modi sunt. Aliquam aperiam debitis deleniti dolorem enim est et
        excepturi fuga illo ipsa labore laborum libero magni minus molestiae neque nostrum nulla
        perferendis possimus qui, quibusdam quisquam quo repellendus repudiandae tenetur vel
        voluptas, voluptates? Ab adipisci, deleniti dolorum ex fugit iste nam, nobis odio
        perferendis praesentium, quia quidem sit suscipit tempora veniam voluptates voluptatum.
        Accusamus aliquid animi corporis deleniti ducimus ex modi neque nobis perferendis, quaerat
        quia repellat ullam voluptate. Autem cumque quaerat soluta vel? Dolore et fuga in labore
        molestiae nobis ratione ullam. At dicta fuga possimus veniam. Dolorem eaque incidunt
        maiores, modi quam reprehenderit repudiandae sunt. Ad delectus fugiat magnam omnis quae. A
        accusamus, delectus est harum in ipsa ipsam iusto mollitia officia perferendis quisquam quo
        sapiente sunt. A atque consectetur debitis delectus, dolor esse nulla officia quam quia
        quidem quo, repellat reprehenderit sapiente sint voluptatum? Ab accusamus consectetur
        consequuntur, corporis deserunt doloremque, ea eius excepturi facere nobis, perspiciatis
        quas sunt suscipit voluptatibus voluptatum! Adipisci aspernatur aut consectetur consequatur
        distinctio dolorum ea, esse ex exercitationem fuga illum ipsam nisi omnis pariatur quas
        quisquam recusandae similique sit suscipit veniam? A, amet asperiores consequatur deleniti
        dignissimos eum excepturi fuga in inventore labore, libero magni modi molestias nisi nobis
        optio possimus quam quidem ratione rerum sed suscipit tempora vel! Beatae, facilis laborum
        minus natus non, odio officia possimus provident ratione, sapiente soluta suscipit. Aliquam
        aperiam architecto, assumenda blanditiis deleniti facilis illo magnam molestias tempore, vel
        vitae voluptate! Aperiam atque doloremque, ducimus excepturi, illo in ipsam iste labore
        mollitia obcaecati quam quis repellendus sequi temporibus veritatis vero, voluptatem
        voluptatum? Inventore minus, vel. Est nihil nostrum quisquam saepe voluptatem. A accusantium
        error, pariatur perferendis tempore tenetur vero vitae? Ad commodi cum cumque excepturi,
        facere illo illum ipsam iusto laudantium magni maiores mollitia nam nisi officia perferendis
        praesentium quidem recusandae similique! Ab accusamus amet animi aperiam, cumque debitis,
        eius fugiat ipsam ipsum iusto labore mollitia possimus, praesentium qui quos repellat
        sapiente totam! Accusamus architecto eaque harum ut. Ab amet atque aut consectetur culpa
        ducimus excepturi facere ipsam libero maxime molestiae molestias numquam odio odit
        praesentium, qui, quo soluta vel velit voluptas! Ad adipisci, beatae, dolor, earum facilis
        labore magnam magni minima mollitia nihil optio vel voluptate! Ab accusamus asperiores atque
        blanditiis consectetur deserunt distinctio eum expedita incidunt necessitatibus nemo optio
        provident qui rerum sed tempora, voluptas voluptatem voluptatibus. Commodi, molestias
        veritatis! Expedita modi quasi soluta? A, alias architecto consectetur distinctio eius enim
        labore laudantium maiores maxime sed sequi similique, temporibus ullam voluptas voluptatem.
        Ab facere quae voluptas? Beatae exercitationem incidunt minima mollitia officiis quae quas
        reiciendis. Accusamus asperiores aspernatur cupiditate dolorem doloremque earum eos fugit
        impedit maiores minus modi natus nobis odit optio placeat provident quae quasi quis, ratione
        reiciendis repellat repellendus sequi tempore ut velit veniam voluptate? Ab accusantium
        animi assumenda atque dolores doloribus eaque earum error esse, est exercitationem iste
        laborum magnam maxime molestiae mollitia natus perferendis quam quibusdam repellendus rerum
        sequi tempora totam voluptas voluptatum. A accusantium aut dignissimos error esse
        exercitationem ipsa maiores, molestiae nulla officia possimus quis, quisquam quod sequi
        suscipit tempora, tenetur vel voluptates. Deleniti dicta incidunt laborum magnam voluptate?
        A, accusantium aliquam amet, at, blanditiis cum dolor dolore doloremque dolorum eligendi
        eveniet impedit incidunt inventore nam numquam odio pariatur possimus quam quis quo repellat
        repudiandae rerum sunt suscipit totam ullam unde vitae! Ab accusamus asperiores atque
        blanditiis commodi culpa cumque ducimus earum excepturi ipsum iste laboriosam laudantium
        maiores minus necessitatibus odio officia ratione repellat reprehenderit sapiente sit sunt,
        ut velit! Accusamus adipisci esse expedita fugit iure laborum rem velit, voluptatem! Ad
        animi at impedit omnis quaerat recusandae repellendus voluptatibus! Amet corporis cum nihil,
        qui quisquam unde voluptatem. Alias earum est expedita explicabo inventore ipsa nihil
        perferendis perspiciatis provident, quod? Ad alias, autem consectetur cumque doloribus ex
        itaque iusto magnam mollitia nesciunt numquam odio, quibusdam quis quo repudiandae sunt,
        ullam velit voluptate. Accusantium aut earum enim hic molestiae natus quisquam quod
        repellendus tempore voluptates! Asperiores at beatae culpa, dolor excepturi fugit ipsa
        libero magni neque non officiis perspiciatis, qui rerum sequi sit. Accusantium, consectetur
        dolor excepturi laudantium quidem sunt veniam voluptates? At beatae dolorum eius fuga fugiat
        illo labore odio odit pariatur, provident, quia saepe temporibus voluptatum! Aspernatur,
        dolore doloribus, eaque est exercitationem illum inventore iste iusto minima minus modi
        mollitia necessitatibus nulla possimus praesentium provident quia quis quo quod
        reprehenderit rerum sint, sit tempora tenetur totam! Ad aliquid autem, cum dolore ea
        exercitationem explicabo laudantium libero modi molestias mollitia necessitatibus nihil odio
        odit, quas, qui rem rerum sit sunt voluptates. Alias atque autem, dolore eligendi excepturi
        explicabo nemo nobis possimus quod tenetur! Sit, vitae, voluptates? Distinctio facilis porro
        soluta ullam veniam? Dicta incidunt nemo nobis officia provident repellendus vel velit vero
        voluptates. Adipisci animi architecto aspernatur aut commodi doloremque ea enim error
        impedit in incidunt ipsa molestiae nemo nesciunt numquam obcaecati, qui quidem quo ratione
        recusandae, rerum voluptas voluptates, voluptatum? Accusantium ad aliquid aspernatur,
        assumenda beatae blanditiis commodi earum eos excepturi harum impedit ipsa minima nemo
        numquam obcaecati quas quasi tenetur voluptate voluptatem voluptatum. Alias aliquid amet
        culpa dolore ducimus ea eaque eveniet excepturi fuga fugiat in iste laborum libero molestias
        mollitia nemo obcaecati, odio perspiciatis quis, reprehenderit saepe sunt veniam. Ad at
        atque, doloremque eligendi eos ex labore magnam magni modi obcaecati officia porro quam
        quibusdam quos rem repellendus similique! Cumque explicabo magnam provident quasi, suscipit
        ullam! Ab accusamus alias commodi excepturi expedita fuga ipsam minus mollitia nesciunt,
        perferendis placeat quibusdam quisquam sunt temporibus vero voluptates voluptatibus? Alias
        cupiditate dignissimos, exercitationem modi nam nostrum obcaecati omnis placeat quia quos
        tempora ut vel? A, animi consequatur consequuntur deleniti dicta distinctio dolor dolores
        doloribus earum error et exercitationem impedit ipsa nisi omnis pariatur perspiciatis quam
        sed sequi similique sit soluta sunt tempore ut vitae voluptas voluptatem! Aspernatur,
        deleniti dignissimos dolor doloribus ea eaque enim eos et maxime obcaecati odit rerum sequi
        tempore velit vero. Aperiam at beatae commodi, earum, eligendi eum explicabo illo impedit
        inventore ipsam, laboriosam minus modi mollitia neque quasi repudiandae sint sunt suscipit
        tempora unde. Adipisci et nobis porro sequi tempora. Distinctio dolorem earum enim facilis,
        fugit ipsam labore magnam minima nostrum perferendis perspiciatis, porro ratione rem
        suscipit ut? Aliquam blanditiis excepturi minima molestias quis sint? Aperiam atque cum
        cumque distinctio dolor earum facere hic, labore molestiae molestias quas quia quibusdam
        quis rerum soluta sunt voluptatibus. Ab amet autem consequuntur distinctio ea ipsam
        laudantium nam natus qui! Ad cum eaque eligendi laboriosam obcaecati quaerat qui sapiente
        unde veniam veritatis? Ad amet animi debitis distinctio dolor eos illo incidunt, iure
        reiciendis sit! A adipisci aperiam architecto assumenda blanditiis deleniti dicta
        dignissimos doloremque ducimus eveniet excepturi expedita explicabo, hic ipsam iure magni
        maxime molestiae natus nemo nesciunt numquam pariatur quas quidem quo repellendus rerum sed
        sit sunt totam ullam velit veritatis vero voluptates. Accusamus aut distinctio dolorum earum
        eum laudantium magni nihil non placeat, quam repudiandae temporibus voluptas voluptatum.
        Assumenda facere iusto molestias obcaecati perspiciatis. Eligendi error exercitationem iusto
        sed sit. Adipisci aliquam consequatur consequuntur culpa harum iste neque perspiciatis
        porro, rerum vel velit voluptatum? Debitis enim ipsa ipsum modi nam neque nihil numquam quas
        soluta, vitae. Odio, sint, tempora. Cumque deleniti illum iusto pariatur voluptatum?
        Asperiores cum cupiditate dolor esse est expedita ipsum maxime nihil omnis, rerum saepe sunt
        veritatis vitae voluptas?
      </p>
    </>
  );
}
