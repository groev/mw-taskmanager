import { useEffect, useRef, useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, TextInput } from "@mantine/core";
import { Box, Card, Checkbox, Group } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { IconChevronRight, IconTrash } from "@tabler/icons-react";

type ListItemProps = {
  index: number;
  form: UseFormReturnType<FullCalendarEvent>;
};

const ListItem = ({ index, form }: ListItemProps) => {
  const [isEditAble, setIsEditAble] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: form.values.subtasks[index].id });

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
            {...form.getInputProps(`subtasks.${index}.checked`, {
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
                textDecoration: form.values.subtasks[index].checked
                  ? "line-through"
                  : "none",
              }}
              variant={isEditAble ? "filled" : "unstyled"}
              {...form.getInputProps(`subtasks.${index}.text`)}
              ref={ref}
              placeholder="TExt"
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
        </Group>
      </Card>
    </ClickAwayListener>
  );
};

export default ListItem;
