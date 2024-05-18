import ClickAwayListener from "react-click-away-listener";
import { ActionIcon, Card, Checkbox, Flex, Group, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { useMutation } from "@tanstack/react-query";

import { deleteEvent, updateEvent } from "./helpers";
import { useCalendarStore } from "./store";

export default function Event({ data }: { data: FullCalendarEvent }) {
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

  const deselect = () => {
    if (selectedEvent?.id == data.id) setSelectedEvent(null);
  };

  const select = () => {
    if (selectedEvent?.id == data.id) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(data);
    }
  };

  const color = getColor(data);

  return (
    <ClickAwayListener onClickAway={deselect}>
      <Flex
        style={{
          pointerEvents: isMs ? "none" : "auto",
        }}
        h={"100%"}
        onClick={() => select()}
      >
        {selectedEvent?.id == data.id && (
          <Group pos="absolute" top="0" left="-2rem" style={{ zIndex: 9999 }}>
            <ActionIcon onClick={() => deleteEvent(selectedEvent.id)}>
              <IconTrash />
            </ActionIcon>
          </Group>
        )}
        <Card bg={color.background} p={8} w={"100%"} h={"100%"}>
          <Group pos="relative" gap={2} justify="space-between" align="center">
            <Text fz={12} c={color.text} fw={500}>
              {data.title}
            </Text>
            {!isMs && (
              <Checkbox
                checked={data.extendedProps.checked}
                onChange={(e) => mutation.mutate(e.target.checked)}
                size="xs"
              />
            )}
          </Group>
        </Card>
      </Flex>
    </ClickAwayListener>
  );
}
