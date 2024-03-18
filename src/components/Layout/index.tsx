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

export default function Layout() {
  const { signout } = useAuthContext();
  const isFetching = useIsFetching();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header
        withBorder={false}
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-5)",
          zIndex: 999999,
        }}
      >
        <Group h="100%" px="md">
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group align="center">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Logo height={40} color="var(--mantine-color-text)" />
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
        <Nav />
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
