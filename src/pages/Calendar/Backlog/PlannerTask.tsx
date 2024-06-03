import { Card, Group, Text, ActionIcon } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { PlannerTask } from "@microsoft/microsoft-graph-types";

import { IconChevronRight } from "@tabler/icons-react";

import { addEvent } from "../helpers";
import { useCalendarStore } from "../store";

const TaskItem = ({
  item,
  disabled,
}: {
  item: PlannerTask;
  disabled?: boolean;
}) => {
  const selectedSlot = useCalendarStore((state) => state.selectedSlot);
  const setSelectedSlot = useCalendarStore((state) => state.setSelectedSlot);
  const events = useCalendarStore((state) => state.events);
  const day = useCalendarStore((state) => state.day);
  const { width } = useViewportSize();
  const isMobile = width < 768; // TODO: use breakpoint

  async function addNewEvent(item: PlannerTask) {
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
      title: item.title,
      startSlot: lastEvent.endSlot,
      endSlot: lastEvent.endSlot + 4,
      checked: false,
      msid: item.id,
      text: item.details?.description,
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
      return await addEvent(event as CalendarEvent);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  return (
    <Card p="xs" style={{ opacity: disabled ? 0.5 : 1 }}>
      <Group>
        <Text flex={1} fz="xs">
          {item.title}
        </Text>
        {!disabled && (
          <ActionIcon
            variant="light"
            onClick={() => addNewEvent(item)}
            size="xs"
          >
            <IconChevronRight />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
};

export default TaskItem;
