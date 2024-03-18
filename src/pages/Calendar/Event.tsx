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
    const stripedBg = `repeating-linear-gradient(
      45deg,
      var(--mantine-color-gray-5),
      var(--mantine-color-gray-5) 5px,
      var(--mantine-color-gray-6) 5px,
      var(--mantine-color-gray-6) 10px
    )`;

    if (data.extendedProps.checked && selectedEvent?.id == data.id)
      return `var(--mantine-color-green-5)`;
    if (data.extendedProps.checked) return `var(--mantine-color-green-8)`;

    if (selectedEvent?.id == data.id) return `var(--mantine-color-orange-6)`;

    if (isMs) return stripedBg;
    return `var(--mantine-color-gray-5)`;
  };

  const mutation = useMutation({
    mutationFn: (checked: boolean) => updateEvent(data.id, { checked }),
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

  return (
    <ClickAwayListener onClickAway={deselect}>
      <Flex h={"100%"} onClick={() => select()}>
        <Card
          shadow="xs"
          bg={getColor(data)}
          style={{
            border: "1px solid var(--mantine-color-dark-5)",
            borderLeft: "4px solid var(--mantine-color-dark-3)",

            borderTop: "0px transparent",
          }}
          pl={8}
          pt={2}
          pr={8}
          pb={2}
          w={"100%"}
          h={"100%"}
        >
          <Group justify="space-between" align="center">
            <Text fz={12} c="background" fw={500}>
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
