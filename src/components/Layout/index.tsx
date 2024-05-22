import { Outlet } from "react-router-dom";
import { AppShell, Button, Group, ActionIcon, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";

import { useAuthContext } from "@/context/AuthContext";

import Logo from "@/images/Logo";

import ColorScheme from "./ColorScheme";

import Nav from "./Nav";

import classes from "./layout.module.css";

export default function Layout() {
  const { signout } = useAuthContext();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell header={{ height: 50 }}>
      <AppShell.Header withBorder={false} className={classes.header}>
        <Group h="100%" px="md">
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group align="center">
              <Burger
                hiddenFrom="sm"
                opened={mobileOpened}
                onClick={toggleMobile}
                size="sm"
              />
              <Burger
                opened={desktopOpened}
                visibleFrom="sm"
                onClick={toggleDesktop}
                size="sm"
              />

              <Logo height={40} />
              {(desktopOpened || mobileOpened) && (
                <Nav onClose={toggleMobile} />
              )}
            </Group>
            <Group>
              <ColorScheme />
              <Button
                leftSection={<IconLogout size={14} />}
                size="xs"
                variant="light"
                visibleFrom="sm"
                onClick={signout}
              >
                Sign-Out
              </Button>
              <ActionIcon
                size="md"
                variant="light"
                hiddenFrom="sm"
                onClick={signout}
              >
                <IconLogout size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main pos="relative">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
