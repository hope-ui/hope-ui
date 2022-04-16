import { HopeProvider, NotificationsProvider } from "@hope-ui/solid";
import { render } from "solid-js/web";

function App() {
  return <div>Hello world</div>;
}

render(
  () => (
    <HopeProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
