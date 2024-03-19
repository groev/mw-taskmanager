import ClickAwayListener from "react-click-away-listener";
import { Flex, Card, Text, Checkbox, Group } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

import { updateEvent } from "./helpers";
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
    mutationFn: (checked: boolean) =>
      updateEvent(data.id, { ...data, checked: checked }),
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
      <Flex h={"100%"} onClick={() => select()}>
        <Card
          bg={color.background}
          pl={8}
          pt={2}
          pr={8}
          pb={2}
          w={"100%"}
          h={"100%"}
        >
          <Group justify="space-between" align="center">
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
