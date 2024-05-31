import ClickAwayListener from "react-click-away-listener";
import {
  ActionIcon,
  Card,
  Checkbox,
  TextInput,
  Textarea,
  Button,
  Flex,
  Box,
  Group,
  Text,
  Modal,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import { useDisclosure, useEventListener } from "@mantine/hooks";

import { IconEdit, IconTrash } from "@tabler/icons-react";

import { useMutation } from "@tanstack/react-query";

import { deleteEvent, updateEvent } from "./helpers";
import { useCalendarStore } from "./store";

export default function Event({ data }: { data: FullCalendarEvent }) {
  const [opened, { open, close }] = useDisclosure();
  const setSelectedEvent = useCalendarStore((state) => state.setSelectedEvent);
  const selectedEvent = useCalendarStore((state) => state.selectedEvent);
  const isMs = data.extendedProps.type === "ms";
  const getColor = (data: FullCalendarEvent) => {
    if (data.extendedProps.checked && selectedEvent?.id == data.id)
      return {
        background: `var(--mantine-color-green-8)`,
        text: "white",
      };
    if (data.extendedProps.checked)
      return {
        background: `var(--mantine-color-green-3)`,
        text: "var(--mantine-color-dark-8)",
      };

    if (selectedEvent?.id == data.id)
      return {
        background: `var(--mantine-color-dark-5)`,
        text: "white",
      };

    if (data.extendedProps?.msid) {
      return {
        background: `var(--mantine-color-grape-3)`,
        text: "var(--mantine-color-dark-8)",
      };
    }

    if (isMs)
      return {
        background: `var(--mantine-color-pink-3)`,
        text: "var(--mantine-color-dark-8)",
      };
    return {
      background: `var(--mantine-color-dark-2)`,
      text: "var(--mantine-color-dark-8)",
    };
  };

  const mutation = useMutation({
    mutationFn: (checked: boolean) => {
      const event = { checked: checked };

      return updateEvent(data.id, event);
    },
  });

  const editText = useMutation({
    mutationFn: ({ text, title }: { text: string; title: string }) => {
      const event = { text: text, title: title };

      return updateEvent(data.id, event);
    },
  });

  const deselect = () => {
    if (selectedEvent?.id == data.id) setSelectedEvent(null);
  };

  const select = () => {
    if (isMs) return;
    if (selectedEvent?.id == data.id) {
      return;
    } else {
      setSelectedEvent(data);
    }
  };

  const color = getColor(data);

  const form = useForm({
    initialValues: {
      text: data.extendedProps?.text || "",
      title: data.title || "",
    },
  });

  console.log(data.extendedProps);

  const ref = useEventListener("dblclick", () => {
    if (data.extendedProps?.joinUrl) {
      console.log(data.extendedProps);
      window.open(data.extendedProps?.joinUrl, "_blank");
    }
    if (!isMs) {
      open();
    }
  });

  return (
    <ClickAwayListener onClickAway={deselect}>
      <Flex ref={ref} h={"100%"} onClick={() => select()}>
        {selectedEvent?.id == data.id && (
          <Stack
            gap={2}
            pos="absolute"
            top="0"
            left="-2rem"
            style={{ zIndex: 999999 }}
          >
            <ActionIcon onClick={() => deleteEvent(selectedEvent.id)}>
              <IconTrash />
            </ActionIcon>
            <ActionIcon>
              <IconEdit onClick={open} />
            </ActionIcon>
            <Modal title="Edit edvent" centered opened={opened} onClose={close}>
              <form
                onSubmit={form.onSubmit((values) =>
                  editText.mutate(values, {
                    onSuccess: () => {
                      close();
                    },
                  })
                )}
              >
                <Stack>
                  <TextInput label="Title" {...form.getInputProps("title")} />
                  <Textarea
                    autosize
                    label="Info"
                    {...form.getInputProps("text")}
                  />
                </Stack>
                <Group justify="flex-end" mt="xl">
                  <Button variant="subtle" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    loading={editText.isPending}
                    type="submit"
                    variant="primary"
                  >
                    Save
                  </Button>
                </Group>
              </form>
            </Modal>
          </Stack>
        )}
        <Card bg={color.background} p={8} w={"100%"} h={"100%"}>
          <Group
            pos="relative"
            gap={"xs"}
            justify="flex-start"
            align="top"
            style={{ flexWrap: "nowrap" }}
          >
            {!isMs && (
              <Box flex={0}>
                <Checkbox
                  checked={data.extendedProps.checked}
                  onChange={(e) => mutation.mutate(e.target.checked)}
                  size="xs"
                />
              </Box>
            )}
            <Box flex={"auto"}>
              <Text inline fz={12} flex={"auto"} c={color.text} fw={500}>
                {data.title}
              </Text>
            </Box>
          </Group>
        </Card>
      </Flex>
    </ClickAwayListener>
  );
}
