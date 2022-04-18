const importComponent = `import { 
  Avatar, 
  AvatarBadge, 
  AvatarGroup,
  AvatarExcess
} from "@hope-ui/design-system"`;

const basicUsage = `<HStack wrap="wrap" spacing="$4">
  <Avatar name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
  <Avatar name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
  <Avatar name="Courtney Watson" src="https://bit.ly/3w2rgom" />
  <Avatar name="Alberto Sanchez" src="https://bit.ly/3q1WqrX" />
  <Avatar name="Nicole Steeves" src="https://bit.ly/37dJ0m7" />
  <Avatar name="Micheal Dunn" src="https://bit.ly/3t5O04P" />
  <Avatar name="Wanda Fisher" src="https://bit.ly/35N1hXl" />
</HStack>`;

const sizes = `<HStack alignItems="flex-start" wrap="wrap" spacing="$4">
  <Avatar size="2xs" name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
  <Avatar size="xs" name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
  <Avatar size="sm" name="Courtney Watson" src="https://bit.ly/3w2rgom" />
  <Avatar size="md" name="Alberto Sanchez" src="https://bit.ly/3q1WqrX" />
  <Avatar size="lg" name="Nicole Steeves" src="https://bit.ly/37dJ0m7" />
  <Avatar size="xl" name="Micheal Dunn" src="https://bit.ly/3t5O04P" />
  <Avatar size="2xl" name="Wanda Fisher" src="https://bit.ly/35N1hXl" />
</HStack>`;

const fallbacks = `<HStack spacing="$4">
  <Avatar name="Monkey D. Luffy" src="broken-link" />
  <Avatar src="broken-link" />
</HStack>`;

const customFallbacks = `<HStack spacing="$4">
  <Avatar 
    bg="$danger9" 
    icon={props => <IconUser fontSize="1.5rem" {...props} />} 
  />
  <Avatar bg="$primary9" />
</HStack>`;

const withBadge = `<HStack spacing="$4">
  <Avatar>
    <AvatarBadge boxSize="1.25em" bg="$success9" />
  </Avatar>

  {/* You can also change the borderColor and bg of the badge */}
  <Avatar>
    <AvatarBadge borderColor="papayawhip" bg="tomato" boxSize="1.25em" />
  </Avatar>
</HStack>`;

const avatarGroup = `<AvatarGroup>
  <Avatar name="Hector Rhodes" src="https://bit.ly/3pWHo72" />
  <Avatar name="Isabella Mckinney" src="https://bit.ly/3tRVozX" />
  <AvatarExcess>+3</AvatarExcess>
</AvatarGroup>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Avatar: {
      baseStyle: {
        root: SystemStyleObject,
        group: SystemStyleObject,
        image: SystemStyleObject,
        initials: SystemStyleObject,
        badge: SystemStyleObject,
        excess: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableAvatarOptions,
        group: ThemeableAvatarGroupOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  sizes,
  fallbacks,
  customFallbacks,
  withBadge,
  avatarGroup,
  theming,
};
