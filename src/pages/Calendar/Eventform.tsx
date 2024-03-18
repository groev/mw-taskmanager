import { useState } from "react";

import { Group, TextInput, Button, ActionIcon } from "@mantine/core";

import { IconPlus, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

import { addEvent } from "./helpers";
import { useCalendarStore } from "./store";

export default function Eventform() {
  const selectedSlot = useCalendarStore((state) => state.selectedSlot);
  const setSelectedSlot = useCalendarStore((state) => state.setSelectedSlot);
  const events = useCalendarStore((state) => state.events);
  const changeDay = useCalendarStore((state) => state.changeDay);
  const day = useCalendarStore((state) => state.day);

  const [title, setTitle] = useState("");

  async function addNewEvent() {
    let lastEvent = {
      day: new Date(day).toISOString().split("T")[0],
      endSlot: 0,
    } as CalendarEvent;

    if (events?.length > 0) {
      lastEvent = events?.reduce((prev, current) => {
        if (!prev?.day || !prev?.startSlot) return current;
        if (!current?.day || !current?.startSlot) return prev;
        // compare dates and slots to find last events
        if (prev?.day > current.day) return prev;
        if (prev?.day < current.day) return current;

        return prev.startSlot > current.startSlot ? prev : current;
      }, lastEvent);
    }

    if (!lastEvent.endSlot) return;
    const event = {
      day: lastEvent.day,
      title: title,
      startSlot: lastEvent.endSlot,
      endSlot: lastEvent?.endSlot + 2,
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

  return (
    <form
      onSubmit={(values: unknown) => addEvent(values as CalendarEvent)}
      className="form"
    >
      <Group
        pos="absolute"
        bottom="0"
        py={0}
        align="center"
        h={50}
        left="0"
        right="0"
        px={"md"}
        style={{
          borderTop: "1px solid var(--mantine-color-dark-5)",
          zIndex: 999999,
        }}
        bg={"var(--mantine-color-body)"}
      >
        <Group gap={0} justify="space-between" w="100%">
          <ActionIcon variant="transparent" onClick={() => changeDay(-1)}>
            <IconArrowLeft />
          </ActionIcon>
          <Group justify="stretch" gap={4}>
            <TextInput
              placeholder="Add activity"
              miw={"15vw"}
              w={200}
              flex={1}
              id="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Button
              leftSection={<IconPlus size={"1rem"} />}
              disabled={title.length === 0}
              type="submit"
              onClick={() => addNewEvent()}
            >
              Add
            </Button>
          </Group>
          <ActionIcon variant="transparent" onClick={() => changeDay(1)}>
            <IconArrowRight />
          </ActionIcon>
        </Group>
      </Group>
    </form>
  );
}
