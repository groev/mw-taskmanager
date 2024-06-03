import { useRef, useState, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Group, Checkbox, Box } from "@mantine/core";
import { ActionIcon, TextInput } from "@mantine/core";

import { IconTrash } from "@tabler/icons-react";

import { useFormContext } from "./formContext";

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

  return (
    <ClickAwayListener onClickAway={() => setIsEditAble(false)}>
      <Card
        ref={setNodeRef}
        withBorder
        p="xs"
        mt="xs"
        style={style}
        {...attributes}
        {...listeners}
      >
        <Group>
          <Checkbox
            radius="50%"
            size="md"
            {...form.getInputProps(`items.${index}.checked`, {
              type: "checkbox",
            })}
          />

          <Box flex={1} onClick={() => setIsEditAble(true)}>
            <TextInput
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
