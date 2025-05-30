import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconCopy, IconEdit, IconTrash } from "@tabler/icons-react";
import { addEvent, deleteEvent, updateEvent } from "./helpers";
import { useDisclosure, useEventListener } from "@mantine/hooks";

import { Calendar } from "@fullcalendar/core/index.js";
import ClickAwayListener from "react-click-away-listener";
import Subtasks from "./Subtasks";
import { useCalendarStore } from "./store";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";

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
    mutationFn: ({
      text,
      title,
      subtasks,
    }: {
      text: string;
      title: string;
      subtasks: {
        id: string;
        text: string;
        checked: boolean;
      }[];
    }) => {
      const event = { text: text, title: title, subtasks: subtasks };

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

  const form = useForm<Partial<CalendarEvent>>({
    initialValues: {
      text: data.extendedProps?.text || "",
      title: data.title || "",
      subtasks: data.extendedProps?.subtasks || [],
    },
  });

  const ref = useEventListener("dblclick", () => {
    if (data.extendedProps?.joinUrl) {
      console.log(data.extendedProps);
      window.open(data.extendedProps?.joinUrl, "_blank");
    }
    if (!isMs) {
      open();
    }
  });

  const progress =
    (form.values.subtasks?.filter((t) => t.checked)?.length /
      form.values?.subtasks?.length) *
    100;

  const hasSubtasks = form.values?.subtasks?.length > 0;

  function copy() {
    const eventDay = data.start;
    eventDay.setDate(eventDay.getDate() + 1);
    addEvent({
      ...data?.extendedProps,
      title: data.title,
      checked: false,
      subtasks:
        data?.extendedProps?.subtasks?.map((t) => {
          return { ...t, checked: false };
        }) || [],
      day: eventDay.toISOString().substring(0, 10),
    });
  }

  console.log(data);

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
            <ActionIcon>
              <IconCopy onClick={copy} />
            </ActionIcon>
            <Modal title="Edit edvent" centered opened={opened} onClose={close}>
              <form
                onSubmit={form.onSubmit((values) =>
                  editText.mutate(values, {
                    onError: (error) => {
                      close();
                    },
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
                  <Subtasks mutation={mutation} form={form} />
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
          {hasSubtasks && (
            <Card.Section mb="xs" bg="gray">
              <SimpleGrid
                cols={form.values.subtasks?.length || 1}
                spacing={"1px"}
              >
                {form.values?.subtasks?.map((task, index) => (
                  <Box
                    w="100%"
                    key={index}
                    h={"1.3rem"}
                    bg={task.checked ? "green" : ""}
                  />
                ))}
              </SimpleGrid>
              <Divider />
              <Text
                fz={10}
                size="xs"
                c="dark"
                pos="absolute"
                right={"0.5rem"}
                top={"0"}
              >
                {form.values.subtasks?.filter((t) => t.checked)?.length}/
                {form.values.subtasks?.length}
              </Text>
            </Card.Section>
          )}
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
