import { Outlet } from "react-router-dom";
import { AppShell, ActionIcon, Stack } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

import { useAuthContext } from "@/context/AuthContext";

import Logo from "@/images/Logo";

import ColorScheme from "./ColorScheme";

import Nav from "./Nav";

import classes from "./layout.module.css";

export default function Layout() {
  const { signout } = useAuthContext();

  return (
    <AppShell navbar={{ width: 80, breakpoint: 0 }}>
      <AppShell.Navbar>
        <Stack className={classes.navbar}>
          <Stack pt="lg">
            <Logo height={40} />
            <Nav />
          </Stack>

          <Stack w={"100%"} justify="center">
            <ColorScheme />

            <ActionIcon
              flex={1}
              className={classes.navlink}
              py="1rem"
              variant="subtle"
              w={"100%"}
              onClick={signout}
            >
              <IconLogout size={"2rem"} />
            </ActionIcon>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main pos="relative">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
