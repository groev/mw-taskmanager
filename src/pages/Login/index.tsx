"use client";

import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Button, Center, Container, Divider, Stack } from "@mantine/core";
import { IconBrandGoogle, IconBrandWindows } from "@tabler/icons-react";

import { useAuthContext } from "@/context/AuthContext";
import Logo from "@/images/Logo";

export default function Home() {
  const auth = getAuth();
  const { setMsToken } = useAuthContext();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleMicrosoftLogin = async () => {
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("calendars.read");
    const signIn = await signInWithPopup(auth, provider);
    const credential = OAuthProvider.credentialFromResult(signIn);
    const accessToken = credential?.accessToken;
    if (!accessToken) return false;
    localStorage.setItem("mstoken", accessToken);
    setMsToken(accessToken);
  };

  return (
    <Container>
      <Center h={"100vh"}>
        <Stack>
          <Logo height={200} color="var(--mantine-color-text)" />
          <Divider label="Wähle deinen Login" labelPosition="center" />
          <Stack>
            <Button
              leftSection={<IconBrandGoogle />}
              fullWidth
              variant="outline"
              size="md"
              onClick={handleGoogleSignIn}
            >
              Google
            </Button>
            <Button
              leftSection={<IconBrandWindows />}
              fullWidth
              variant="outline"
              size="md"
              onClick={() => handleMicrosoftLogin()}
            >
              Microsoft
            </Button>
          </Stack>
        </Stack>
      </Center>
    </Container>
  );
}
