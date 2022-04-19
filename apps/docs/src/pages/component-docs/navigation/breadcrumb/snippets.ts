const importComponent = `import { 
  Breadcrumb, 
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from "@hope-ui/solid"`;

const basicUsage = `<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>`;

const separator = `<Breadcrumb separator="-">
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>`;

const iconSeparator = `<Breadcrumb separator={<IconChevronRight color="$neutral11" />}>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>`;

const withEndSeparator = `<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
</Breadcrumb>`;

const spacing = `<Breadcrumb spacing="$4">
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>`;

const composition = `<Breadcrumb fontWeight="$medium" fontSize="$sm" spacing="$4">
  <BreadcrumbItem>
    <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
      Home
    </BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink href="#" _hover={{ color: "tomato" }}>
      Docs
    </BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage _hover={{ color: "$success10" }}>
      Breadcrumb
    </BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>`;

const withRoutingLibrary = `import { Link } from "solid-app-router"

<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink as={Link} href="#">Home</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink as={Link} href="#">Docs</BreadcrumbLink>
    <BreadcrumbSeparator />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbLink currentPage>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Breadcrumb: {
      baseStyle: {
        root: SystemStyleObject,
        item: SystemStyleObject,
        link: SystemStyleObject,
        separator: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableBreadcrumbOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  separator,
  iconSeparator,
  withEndSeparator,
  spacing,
  composition,
  withRoutingLibrary,
  theming,
};
