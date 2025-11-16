import {
  Button,
  PasswordInput,
  Stack,
  TextInput,
  Alert,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";

export default function Mailform() {
  const auth = getAuth();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return signInWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => mutate(values))}>
      <Stack>
        <TextInput placeholder="E-Mail" {...form.getInputProps("email")} />
        <PasswordInput
          placeholder="Password"
          {...form.getInputProps("password")}
        />
        <Transition mounted={!!error}>
          {(transitionStyles) => (
            <Alert
              color="red"
              title="Fehler bei der Anmeldung"
              style={transitionStyles}
            >
              {error?.message}
            </Alert>
          )}
        </Transition>
        <Button loading={isPending} type="submit" fullWidth>
          Anmelden
        </Button>
      </Stack>
    </form>
  );
}
