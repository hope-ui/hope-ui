import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, HopeProvider, Modal, ModalContent, ModalOverlay } from ".";

export function App() {
  const [isOpen, setIsOpen] = createSignal(false);
  return (
    <Box p="$4">
      <Button onClick={() => setIsOpen(true)}>Open modal</Button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent p="$4">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quam, vero?
        </ModalContent>
      </Modal>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam perspiciatis esse minima
        eveniet odit ab, optio molestias temporibus illo totam consequuntur amet, soluta pariatur
        architecto assumenda cumque at deserunt necessitatibus aperiam facere suscipit cupiditate
        dicta. Sequi voluptas quo necessitatibus neque hic assumenda voluptatum itaque illo
        reiciendis optio culpa dolor tenetur mollitia quasi cum eveniet, sunt vel amet, autem
        eligendi nam pariatur. Voluptatibus ipsum iusto perferendis voluptate id provident error
        fugit dolorum eveniet incidunt! Sint, quia! In autem odit ipsum molestiae rerum repellat
        consequatur odio, corrupti laudantium fugit dignissimos dolore maiores optio ea commodi quae
        atque reiciendis! Autem harum dolorem, minima totam nulla, provident mollitia consequuntur
        ipsam nihil pariatur neque perspiciatis molestias. Velit corrupti exercitationem magni
        nesciunt a libero rerum beatae aliquam eum sed labore illum, possimus quaerat, itaque
        provident amet! Dolores beatae placeat qui aut architecto cumque laudantium labore nihil
        molestias autem exercitationem atque unde ipsum modi nobis vitae vero magni maxime hic
        provident, ab perferendis distinctio deleniti! Deleniti facilis provident laboriosam culpa
        aperiam enim labore reiciendis assumenda voluptatem exercitationem fugiat harum doloribus,
        laborum qui blanditiis suscipit ducimus corrupti quis asperiores in iusto numquam magnam!
        Enim alias expedita omnis debitis quas temporibus. Soluta, ullam. Dignissimos unde cum
        eveniet, praesentium corrupti error enim laudantium iste quia esse! Unde amet quae
        consequatur consequuntur pariatur animi ullam molestias ipsam dolor. Reprehenderit adipisci
        fuga maiores quibusdam deleniti quo ipsum veniam placeat, laboriosam distinctio quidem. Ut
        officiis repellat explicabo deserunt asperiores blanditiis non illum soluta enim maxime odio
        esse eius, molestias veritatis fugiat, error at reprehenderit alias labore nam reiciendis
        exercitationem molestiae. Maiores nemo esse excepturi consequatur dolore quos numquam modi
        praesentium obcaecati quasi cum expedita eos, aut dicta fugit voluptates commodi adipisci
        nobis non sapiente at? Ratione ullam, doloribus odio sequi, omnis in repellat architecto
        adipisci repudiandae libero fugiat vero assumenda ipsa natus qui veritatis, totam accusamus
        eum inventore suscipit non asperiores id? Praesentium quia est maiores quisquam voluptatem
        eveniet nesciunt velit debitis ullam. Esse maxime eos pariatur sequi laudantium perspiciatis
        earum repudiandae totam assumenda accusantium aperiam vero illum, dicta velit molestias,
        facilis molestiae? Asperiores veniam, deleniti iure magni sit, accusamus enim repellat
        aperiam aut laborum reiciendis praesentium nam excepturi tempora aspernatur, exercitationem
        aliquid minus delectus. Itaque beatae veniam placeat tempore alias quisquam at harum
        perferendis quia sapiente molestiae officia nostrum, optio unde aspernatur impedit libero?
        Accusantium cumque maxime saepe dignissimos necessitatibus nam enim voluptates molestiae eum
        amet hic animi consequuntur illo illum repellendus, sequi numquam assumenda alias aliquam
        doloribus quas laborum harum fugit. Praesentium, non veritatis? Magnam eligendi eveniet quae
        voluptas ipsum ex provident facere doloribus dolorum quis corrupti perferendis quam fuga,
        mollitia illo odit itaque dignissimos corporis, vel, ea velit minus? Numquam magnam libero
        obcaecati adipisci vel repellat saepe, tempora nihil culpa deserunt nam. Id, quibusdam neque
        deleniti alias aliquam corrupti officia cupiditate ipsa voluptatibus, expedita dolores quasi
        aliquid vero similique maxime odio ab molestias tempore nisi sunt excepturi repellendus
        libero quod! Similique eligendi repellendus accusamus suscipit culpa nulla vero tempora
        obcaecati voluptates dicta sapiente commodi repellat eaque, quidem alias ipsa. Praesentium,
        porro corrupti molestiae provident nihil ab doloremque perspiciatis alias cum, eum inventore
        unde iusto obcaecati veniam ipsa vitae harum. Temporibus asperiores enim modi atque quisquam
        est at delectus recusandae eveniet nostrum, voluptates neque odio ullam culpa quam optio
        fuga obcaecati, esse laborum maxime explicabo velit possimus et consequatur. Quis nemo
        explicabo vero accusantium, in incidunt magnam blanditiis minus minima, vel nisi est.
        Dolorum, laudantium natus velit iste mollitia pariatur tempore tempora ipsum illo aut atque
        eum beatae tenetur, sed deserunt omnis aliquam repudiandae. Dolore assumenda nihil aperiam
        laborum ipsam. Quia magnam vitae porro sapiente cupiditate numquam ullam culpa
        necessitatibus, debitis possimus praesentium dolor illo omnis esse nam? Facere quis natus
        quisquam praesentium unde similique ullam aliquam vitae quidem veniam, asperiores laboriosam
        veritatis voluptatibus magni ratione repellat repellendus minus aspernatur tenetur eveniet
        voluptatem! Culpa numquam similique aperiam, asperiores porro inventore ducimus eveniet
        quibusdam fugiat? Aut corporis consectetur iste eligendi nostrum eos animi ullam provident
        numquam porro voluptatum voluptates illo alias, nemo necessitatibus cupiditate. Error,
        facere. Illo numquam fuga nam harum quo in? Dolor voluptate quisquam quis voluptatem
        corrupti fugit alias aliquid expedita, consequuntur magni dolorem obcaecati quas. Dicta
        quidem animi tempora illum sapiente sit eum sed autem dolore. Repudiandae recusandae impedit
        illum nulla esse soluta repellendus saepe optio, blanditiis atque quo error qui voluptatum
        numquam cum tenetur sapiente fugiat doloribus corrupti aliquid. Rerum, voluptatibus maxime
        excepturi expedita voluptatum, nobis ab accusantium quibusdam dicta fuga ut! Nihil hic
        libero animi aspernatur voluptatibus asperiores. Illo inventore nobis nihil quis iusto.
        Deleniti ullam voluptatem animi, quibusdam maiores incidunt illum, impedit asperiores, autem
        porro expedita et. Facere repellat doloremque rerum. Quo ea eos tenetur architecto possimus
        odit ab repellendus consequatur esse ipsa et, ad inventore dolores fuga aliquid pariatur,
        illum soluta autem eveniet impedit, expedita libero? Ut animi praesentium modi minus labore
        doloribus velit, laboriosam quam aliquam, nobis cum? Iste nostrum quia libero unde,
        recusandae, aut quasi delectus, hic maiores repellat natus in est! Fuga beatae ipsum
        asperiores repellat reiciendis, laborum hic odit voluptatem eveniet quidem unde ipsa fugiat,
        veritatis corrupti libero officiis consectetur inventore eligendi tempore tempora iste
        culpa. Quod rerum qui cum beatae. Quod officiis earum corporis non voluptatum. Rem odit
        facilis, cumque ab officiis consequatur blanditiis quas. Sed fugiat cum nostrum nulla fuga
        suscipit et odit, iusto nam non, unde reprehenderit aperiam nisi quidem officia similique
        repellendus facilis eligendi quo, ex quaerat totam corrupti minima? Nesciunt nam rem, magni
        aut impedit labore, accusamus quasi alias commodi quia quod voluptatum repudiandae? Et nisi
        explicabo quia architecto accusantium fuga eligendi nobis rerum a quis nihil, impedit quo
        minus iure placeat quae beatae eaque quidem sit recusandae modi. Quos voluptatibus dolor at
        qui vero aut quod fuga eos optio nulla illum, aliquam dolorem maiores ab commodi natus, amet
        cupiditate praesentium itaque velit. Temporibus tempora distinctio repudiandae reprehenderit
        ab dolorum praesentium enim odio, unde ipsum libero, ducimus ut quae beatae vel quam
        dignissimos deserunt corporis? Tempora odit dicta laborum error dolore esse eos, numquam id
        commodi voluptatibus veniam labore iusto harum eligendi nostrum, similique libero quia.
      </p>
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
