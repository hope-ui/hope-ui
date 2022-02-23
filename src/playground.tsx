import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  const [opened, setOpened] = createSignal(false);

  return (
    <Box p="$4">
      <VStack alignItems="start" spacing="$4">
        <Button onClick={toggleColorMode}>Toggle color mode</Button>
        <Button onClick={() => setOpened(true)}>Open drawer</Button>
        <Modal opened={opened()} onClose={() => setOpened(false)} scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Header</ModalHeader>
            <ModalCloseButton />
            <Box h="300px" bg="tomato"></Box>
            <ModalBody>
              <div>
                <div>
                  <span>
                    <div>
                      <section>
                        <div>
                          <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam, distinctio quos possimus
                            quibusdam iure commodi consequatur natus tempora nisi rem pariatur voluptas vitae,
                            veritatis, dignissimos explicabo fugiat rerum! Velit a, odio totam magnam officiis dolor
                            quia dicta veritatis maiores libero tenetur quis cum laborum non, sit voluptatem temporibus
                            maxime debitis ullam hic, atque consectetur? Ex nihil, delectus labore impedit dignissimos
                            asperiores provident ipsa nulla minus accusamus et repellendus recusandae facere
                            exercitationem qui magni! Iure rerum dicta facilis placeat autem consequuntur commodi in
                            exercitationem nesciunt repudiandae praesentium quo quos, qui fugit perferendis reiciendis
                            corrupti quibusdam magnam labore! Molestias magnam deleniti tempore. Lorem ipsum dolor sit
                            amet consectetur, adipisicing elit. Quisquam, distinctio quos possimus quibusdam iure
                            commodi consequatur natus tempora nisi rem pariatur voluptas vitae, veritatis, dignissimos
                            explicabo fugiat rerum! Velit a, odio totam magnam officiis dolor quia dicta veritatis
                            maiores libero tenetur quis cum laborum non, sit voluptatem temporibus maxime debitis ullam
                            hic, atque consectetur? Ex nihil, delectus labore impedit dignissimos asperiores provident
                            ipsa nulla minus accusamus et repellendus recusandae facere exercitationem qui magni! Iure
                            rerum dicta facilis placeat autem consequuntur commodi in exercitationem nesciunt
                            repudiandae praesentium quo quos, qui fugit perferendis reiciendis corrupti quibusdam magnam
                            labore! Molestias magnam deleniti tempore.
                          </p>
                        </div>
                      </section>
                    </div>
                  </span>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Accusantium possimus dicta ad ullam voluptates
          voluptatem quam, impedit vel temporibus atque? Quasi laudantium possimus, aliquam quia ex totam aspernatur,
          harum modi ullam libero natus suscipit numquam fugiat id! Ex quam tempore non exercitationem? Eos assumenda
          nostrum debitis reiciendis tenetur atque voluptates eligendi dolor pariatur ipsam aliquam, minus omnis aut
          tempora ad, soluta blanditiis autem suscipit provident excepturi. Temporibus, ab illum excepturi praesentium
          amet natus rerum eos accusantium distinctio saepe quo voluptatum eveniet quam fugiat veniam illo doloremque
          provident tenetur nam minus. Aut aliquam enim libero laborum dolorum culpa, quo nulla numquam. Necessitatibus
          iusto asperiores tempore ipsa excepturi. Sed unde nobis quo, nihil in molestias, aspernatur atque nemo tempora
          eos repudiandae quae quos, repellendus aut? Veniam quas molestias ipsam vel, et, repellendus eveniet
          praesentium dignissimos numquam sequi necessitatibus officia corrupti accusantium nulla nisi dolore esse!
          Recusandae perferendis consequuntur ullam doloremque iusto consequatur accusantium, deleniti quos voluptatem
          eos alias nihil, quaerat eligendi commodi aliquam, praesentium dolorem sunt aperiam natus? Temporibus quasi
          unde voluptatibus culpa iste illum molestiae reprehenderit cumque odit! Incidunt harum veniam atque deleniti,
          excepturi expedita numquam ullam ipsa quaerat facilis tempore vero eum, temporibus culpa vitae dolores
          accusantium dolor amet, voluptates velit cumque magni. Veritatis eveniet enim minima quisquam alias cum odit
          nam ipsum ut! Libero iure expedita repellat tempore illo earum fugiat facere vitae officia eius optio iste
          dignissimos excepturi velit ratione cupiditate voluptate neque nihil, perferendis tenetur, sunt eaque quasi
          veniam consectetur? Eum obcaecati iusto expedita esse sapiente modi sed perspiciatis recusandae facilis alias,
          in, explicabo sequi ab minima, autem consectetur impedit temporibus dolorem cumque laborum? Iusto voluptatem
          facilis quas atque rerum. A ullam perspiciatis vero praesentium at repellendus nostrum illum, doloremque
          dignissimos placeat ea sunt est aspernatur sed odit commodi neque deserunt amet ipsa. Aut impedit repellat
          iusto modi velit ea quas unde sint qui ut totam, quis distinctio voluptates dicta nisi, molestiae consectetur?
          Numquam esse necessitatibus libero inventore explicabo soluta eligendi laboriosam odit, quod labore molestiae
          laborum minima modi nam pariatur, ipsa illo? Libero qui minus hic fugiat quae, doloribus omnis necessitatibus
          eius, cum vel dolorem sint quisquam laudantium sed. Dignissimos quos magni nam iste? Eum in earum commodi
          expedita, fugit molestias. Ipsum praesentium modi repellat pariatur accusantium quidem, perferendis animi
          blanditiis voluptatibus vel similique tempora totam deserunt? Magni sed neque accusantium error itaque
          voluptas corrupti perferendis aliquam dolorem. Provident velit, nemo sapiente quam magni perferendis minima
          eaque? Harum tempore molestiae unde dolores commodi inventore aut a vel ex officia blanditiis praesentium,
          incidunt quisquam suscipit placeat. Labore excepturi at non quo optio saepe vero voluptatibus reiciendis odit
          harum, quas, officiis provident corporis debitis pariatur aut, culpa iste. Voluptate dicta numquam veniam
          doloremque culpa. Voluptatem porro similique eveniet reprehenderit facere ea doloremque nostrum quisquam
          laudantium vitae quos, laborum omnis explicabo rem sunt repellendus nulla sapiente! Minima aperiam accusantium
          magni iste, voluptas incidunt fuga placeat corrupti dolorum quas mollitia molestiae libero nam unde ex iusto
          voluptatibus consequatur autem tenetur, perferendis culpa nostrum. Explicabo reprehenderit fuga incidunt
          repellendus, consequuntur molestias ab ducimus fugiat iusto deleniti consectetur exercitationem ullam quod
          placeat suscipit quos temporibus consequatur dolore, illo nam magnam. Vero quisquam, tempore voluptatum
          pariatur labore rerum magnam aliquam dolores impedit minus earum? Ipsam commodi quas et possimus minus omnis
          vero eveniet dolorum dolorem, ut blanditiis laboriosam sint ipsum numquam inventore doloremque! Voluptatum
          sint ullam optio. Dolores soluta cum dolore expedita beatae explicabo aliquam similique, voluptatem tenetur
          architecto alias quae eos numquam, deserunt voluptates reiciendis quis facilis minus labore, debitis dolorum
          necessitatibus. Eius obcaecati amet modi sed repellat mollitia saepe omnis praesentium, nostrum quas quasi eum
          facere at tempora cupiditate deleniti dolore maxime. Fugit illo, sapiente magnam quis ipsa ducimus repellendus
          libero! Reiciendis repellendus sunt aperiam architecto accusantium doloribus excepturi quas facilis!
          Laudantium aliquid amet voluptates ad nisi eaque unde pariatur ducimus suscipit temporibus! Tenetur quisquam
          esse dolorem vitae ea, dicta nostrum voluptates, molestiae molestias beatae id eaque saepe nam odio deserunt
          fuga sint repellendus eos ipsa veritatis aliquid harum ipsum. Tempore necessitatibus quod a doloribus ut magni
          molestias possimus ad, soluta nemo nam quibusdam dolorum eum odio ea error alias praesentium veniam, est,
          quidem minus ducimus sapiente pariatur! Repudiandae assumenda quibusdam enim veritatis adipisci maiores vel,
          laboriosam magni fuga soluta, ratione eius. Soluta temporibus corrupti, dolore eveniet, deserunt assumenda
          excepturi voluptate minima veniam commodi aperiam accusamus laborum esse, minus animi qui mollitia? Ex
          temporibus sed porro! Pariatur veritatis rem consequatur tempora, eligendi quo nostrum! Fuga perferendis vitae
          voluptas, accusamus quaerat vel magnam nesciunt dolorum aperiam at. Ullam quam dolor quibusdam possimus
          praesentium nemo illum, corrupti sequi amet vitae voluptate veritatis repellat dicta iste delectus eos totam
          quae temporibus architecto quasi deleniti? Qui porro sunt aperiam dolores, alias ipsum eos, molestias
          voluptatibus obcaecati, unde culpa reprehenderit sapiente adipisci? Animi quos earum modi atque cum sint
          perspiciatis fugiat porro hic doloribus consequatur illum quo nam optio dicta, culpa adipisci perferendis
          excepturi dolor distinctio explicabo beatae. Sequi, dolores! Provident, explicabo, deserunt voluptatibus ipsam
          atque adipisci nesciunt sunt soluta dolorem, dolores fugiat quod ut ipsa perspiciatis veritatis aut quae
          neque. Cum rerum iusto eveniet, non mollitia neque possimus at ab soluta reiciendis nisi dicta odio deserunt
          cupiditate blanditiis nam consequatur delectus dolore voluptate accusamus fugiat ipsa ex illo dolorem. Officia
          molestias soluta obcaecati corrupti, illo tempora sit dignissimos culpa reprehenderit a ipsa ullam excepturi.
          Voluptatum, voluptate iste minus dolor quae laudantium ea neque consequatur optio vel illo nesciunt
          consequuntur impedit expedita quis sapiente delectus harum similique adipisci labore, itaque quidem ducimus
          quo? Doloremque praesentium velit quis esse labore totam molestias enim nemo iste culpa a neque sed
          repellendus ratione qui, fugit provident atque. A laboriosam magni error recusandae dicta ullam animi corporis
          dolore, voluptatem dolorum consequatur earum dignissimos minus velit vitae aperiam impedit atque molestiae
          pariatur illo incidunt! Beatae animi similique eius deleniti voluptatum, recusandae molestiae repudiandae amet
          voluptates id omnis quod ut velit earum ex nobis pariatur! Aut at vitae dolorum ipsa a reiciendis laudantium
          alias minima, consequuntur atque facere. Distinctio error, blanditiis placeat itaque accusantium, dolore
          nesciunt ipsa eveniet minus, est ducimus labore.
        </p>
      </VStack>
    </Box>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
