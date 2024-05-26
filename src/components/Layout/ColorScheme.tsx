import { useMantineColorScheme, Switch, Center } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

function ColorScheme() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Center>
      <Switch
        color="dark"
        size="md"
        my="auto"
        onLabel={<IconSun size="1.2rem" color="var(--mantine-color-text)" />}
        offLabel={<IconMoon size="1.2rem" color="var(--mantine-color-text)" />}
        checked={colorScheme === "dark"}
        onChange={(event) =>
          setColorScheme(event.currentTarget.checked ? "dark" : "light")
        }
      />
    </Center>
  );
}

export default ColorScheme;
