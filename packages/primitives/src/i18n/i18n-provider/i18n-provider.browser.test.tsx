import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { I18nProvider, useLocale } from "./i18n-provider";

function LocaleProbe(props: { id: string }) {
  const { locale, direction } = useLocale();
  return (
    <p id={props.id} data-locale={locale()} data-direction={direction()}>
      {locale()}
    </p>
  );
}

function TranslateProbe(props: { id: string }) {
  const { t } = useLocale();
  return <p id={props.id}>{t("calendar.today")}</p>;
}

describe("I18nProvider / useLocale", () => {
  it("provides an explicit locale and its derived direction to descendants", async () => {
    const { container, dispose } = mount(() => (
      <I18nProvider locale="ar-EG">
        <LocaleProbe id="probe" />
      </I18nProvider>
    ));

    const probe = container.querySelector("#probe") as HTMLElement;
    expect(probe.getAttribute("data-locale")).toBe("ar-EG");
    expect(probe.getAttribute("data-direction")).toBe("rtl");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("derives 'ltr' for a Latin-script explicit locale", async () => {
    const { container, dispose } = mount(() => (
      <I18nProvider locale="fr-FR">
        <LocaleProbe id="probe" />
      </I18nProvider>
    ));

    const probe = container.querySelector("#probe") as HTMLElement;
    expect(probe.getAttribute("data-locale")).toBe("fr-FR");
    expect(probe.getAttribute("data-direction")).toBe("ltr");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("falls back to the browser default outside a provider", async () => {
    const { container, dispose } = mount(() => <LocaleProbe id="probe" />);

    const probe = container.querySelector("#probe") as HTMLElement;
    expect(typeof probe.getAttribute("data-locale")).toBe("string");
    expect(["ltr", "rtl"]).toContain(probe.getAttribute("data-direction"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("I18nProvider — message resolver (t)", () => {
  it("re-renders a t() binding reactively when the locale changes", async () => {
    const [locale, setLocale] = createSignal("en-US");
    const { container, dispose } = mount(() => (
      <I18nProvider locale={locale()}>
        <TranslateProbe id="probe" />
      </I18nProvider>
    ));

    const probe = container.querySelector("#probe") as HTMLElement;
    expect(probe.textContent).toBe("Today");

    flush(() => setLocale("fr-FR"));
    expect(probe.textContent).toBe("Aujourd'hui");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("resolves the built-in catalog with zero config (no provider)", async () => {
    const { container, dispose } = mount(() => <TranslateProbe id="probe" />);
    // The default context uses the browser locale; en-US in the test environment.
    expect(container.querySelector("#probe")?.textContent).toBe("Today");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a `translate` overlay win, falling through to the built-in on null", async () => {
    const { container, dispose } = mount(() => (
      <I18nProvider
        locale="en-US"
        translate={(key) => (key === "calendar.today" ? "Aujourd'hui (overlay)" : null)}
      >
        <TranslateProbe id="probe" />
      </I18nProvider>
    ));
    expect(container.querySelector("#probe")?.textContent).toBe("Aujourd'hui (overlay)");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a per-key `messages` override win over the built-in catalog", async () => {
    const { container, dispose } = mount(() => (
      <I18nProvider locale="en-US" messages={{ "en-US": { "calendar.today": "Now" } }}>
        <TranslateProbe id="probe" />
      </I18nProvider>
    ));
    expect(container.querySelector("#probe")?.textContent).toBe("Now");
    await expectNoA11yViolations(container);
    dispose();
  });
});
