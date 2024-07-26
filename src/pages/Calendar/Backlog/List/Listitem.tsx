import { ActionIcon, TextInput } from "@mantine/core";
import { Box, Card, Checkbox, Group } from "@mantine/core";
import { IconChevronRight, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { CSS } from "@dnd-kit/utilities";
import ClickAwayListener from "react-click-away-listener";
import { addEvent } from "../../helpers";
import { useCalendarStore } from "../../store";
import { useFormContext } from "./formContext";
import { useSortable } from "@dnd-kit/sortable";
import { useViewportSize } from "@mantine/hooks";

type ListItemProps = {
  index: number;
};

const ListItem = ({ index }: ListItemProps) => {
  const form = useFormContext();

  const [isEditAble, setIsEditAble] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: form.getValues().items[index].id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  useEffect(() => {
    if (isEditAble && ref.current) {
      ref.current?.focus();
    } else {
      ref.current?.blur();
    }
  }, [ref, isEditAble]);

  const selectedSlot = useCalendarStore((state) => state.selectedSlot);
  const setSelectedSlot = useCalendarStore((state) => state.setSelectedSlot);
  const events = useCalendarStore((state) => state.events);
  const day = useCalendarStore((state) => state.day);
  const { width } = useViewportSize();
  const isMobile = width < 768; // TODO: use breakpoint

  async function addNewEvent(item: ListItem) {
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
      msid: item.id || "",
      text: "",
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
    <ClickAwayListener onClickAway={() => setIsEditAble(false)}>
      <Card
        ref={setNodeRef}
        withBorder
        p={2}
        pl="xs"
        mt="xs"
        py={0}
        style={style}
        {...attributes}
        {...listeners}
      >
        <Group>
          <Checkbox
            radius="50%"
            size="xs"
            {...form.getInputProps(`items.${index}.checked`, {
              type: "checkbox",
            })}
          />

          <Box flex={1} onClick={() => setIsEditAble(true)}>
            <TextInput
              p={0}
              size="xs"
              style={{
                cursor: isDragging ? "grabbing" : "grab",

                pointerEvents: "auto",
                textDecoration: form.getValues().items[index].checked
                  ? "line-through"
                  : "none",
              }}
              variant={isEditAble ? "filled" : "unstyled"}
              {...form.getInputProps(`items.${index}.title`)}
              ref={ref}
              placeholder="Item title"
            />
          </Box>
          {isEditAble && (
            <ActionIcon
              size="xs"
              variant="transparent"
              onClick={() => form.removeListItem("items", index)}
            >
              <IconTrash />
            </ActionIcon>
          )}
          <ActionIcon
            size="sm"
            onClick={() => addNewEvent(form.getValues().items[index])}
          >
            <IconChevronRight />
          </ActionIcon>
        </Group>
      </Card>
    </ClickAwayListener>
  );
};

export default ListItem;
