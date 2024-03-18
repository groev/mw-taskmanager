import { useMantineColorScheme, Switch } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

function ColorScheme() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Switch
      color="dark"
      onLabel={<IconSun size="1rem" color="var(--mantine-color-text)" />}
      offLabel={<IconMoon size="1rem" color="var(--mantine-color-text)" />}
      checked={colorScheme === "dark"}
      onChange={(event) =>
        setColorScheme(event.currentTarget.checked ? "dark" : "light")
      }
    />
  );
}

export default ColorScheme;
