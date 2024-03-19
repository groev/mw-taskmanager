import { Outlet } from "react-router-dom";
import {
  AppShell,
  Button,
  Group,
  ActionIcon,
  Loader,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { useIsFetching } from "@tanstack/react-query";

import { useAuthContext } from "@/context/AuthContext";

import Logo from "@/images/Logo";

import ColorScheme from "./ColorScheme";

import Nav from "./Nav";

import classes from "./layout.module.css";

export default function Layout() {
  const { signout } = useAuthContext();
  const isFetching = useIsFetching();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
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
              {isFetching && <Loader color="dark" size="xs" />}
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
      <AppShell.Navbar>
        <Nav close={close} />
        <Button
          size="md"
          variant="light"
          hiddenFrom="sm"
          onClick={signout}
        ></Button>
      </AppShell.Navbar>
      <AppShell.Main pos="relative">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
