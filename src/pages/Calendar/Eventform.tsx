import { useState } from "react";

import { Group, TextInput, Button, ActionIcon, Box, Text } from "@mantine/core";

import { useViewportSize } from "@mantine/hooks";

import { IconPlus, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

import { addEvent } from "./helpers";
import { useCalendarStore } from "./store";

export default function Eventform() {
  const selectedSlot = useCalendarStore((state) => state.selectedSlot);
  const setSelectedSlot = useCalendarStore((state) => state.setSelectedSlot);
  const events = useCalendarStore((state) => state.events);
  const changeDay = useCalendarStore((state) => state.changeDay);
  const day = useCalendarStore((state) => state.day);
  const { width } = useViewportSize();
  const isMobile = width < 768;
  const [title, setTitle] = useState("");

  async function addNewEvent() {
    let lastEvent = {
      day: new Date(day).toISOString().split("T")[0],
      endSlot: 4,
    } as CalendarEvent;

    if (events?.length > 0) {
      lastEvent = events
        ?.filter((event) => {
          if (isMobile) return event.day === day;
          return true;
        })
        .reduce((prev, current) => {
          if (!prev?.day || !prev?.startSlot) return current;
          if (!current?.day || !current?.startSlot) return prev;
          // compare dates and slots to find last events
          if (prev?.day > current.day) return prev;
          if (prev?.day < current.day) return current;

          return prev.startSlot > current.startSlot ? prev : current;
        }, lastEvent);
    }
    if (typeof lastEvent.endSlot === "undefined") return;

    const event = {
      day: lastEvent.day,
      title: title,
      startSlot: lastEvent.endSlot,
      endSlot: lastEvent.endSlot + 2,
      checked: false,
    };
    if (event.endSlot > 68) {
      const date = new Date(lastEvent.day as string);
      date.setDate(date.getDate() + 1);
      event.day = date.toISOString().split("T")[0];
      event.startSlot = 0;
      event.endSlot = 2;
    }
    if (selectedSlot) {
      event.day = selectedSlot.start.toISOString().split("T")[0];
      console.log(event);
      event.startSlot = Math.floor(
        (selectedSlot.start.getHours() - 6) * 4 +
          selectedSlot.start.getMinutes() / 15
      );
      event.endSlot = Math.floor(
        (selectedSlot.end.getHours() - 6) * 4 +
          selectedSlot.end.getMinutes() / 15
      );
      setSelectedSlot(null);
    }

    try {
      setTitle("");
      return await addEvent(event as CalendarEvent);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const thisMonth = new Date(day).getMonth();
  const thisYear = new Date(day).getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Box>
      <form
        onSubmit={(values: unknown) => addEvent(values as CalendarEvent)}
        className="form"
      >
        <Group
          bottom={0}
          py={0}
          align="center"
          left="0"
          right="0"
          px={"md"}
          style={{
            paddingBottom: `env(safe-area-inset-bottom)`,

            borderBottom: "1px solid var(--mantine-color-dark-5)",
            zIndex: 999999,
          }}
          bg={"var(--mantine-color-body)"}
        >
          <Group gap={0} justify="space-between" w="100%">
            <Text visibleFrom="xs" size="2rem" py="lg">
              {monthNames[thisMonth]} {thisYear}
            </Text>
            <Group maw={"400px"} flex={1} justify="stretch" gap={4}>
              <TextInput
                placeholder="Add activity"
                flex={1}
                id="input"
                my="xs"
                size="xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Button
                size="xs"
                visibleFrom="sm"
                leftSection={<IconPlus size={"1rem"} />}
                disabled={title.length === 0}
                type="submit"
                onClick={() => addNewEvent()}
              >
                Add
              </Button>
              <ActionIcon
                size="xs"
                mx="xs"
                hiddenFrom="sm"
                onClick={() => addNewEvent()}
              >
                <IconPlus size={"1rem"} />
              </ActionIcon>
            </Group>
            <Group>
              <ActionIcon
                variant="transparent"
                onClick={() => changeDay(-1, isMobile)}
              >
                <IconArrowLeft />
              </ActionIcon>
              <ActionIcon
                variant="transparent"
                onClick={() => changeDay(1, isMobile)}
              >
                <IconArrowRight />
              </ActionIcon>
            </Group>
          </Group>
        </Group>
      </form>
    </Box>
  );
}
