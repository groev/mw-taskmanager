import { Fragment, useState, useEffect } from "react";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ActionIcon, Group, TextInput } from "@mantine/core";

import { UseFormReturnType } from "@mantine/form";

import { IconPlus } from "@tabler/icons-react";

import Subtask from "./Subtask";

type Props = {
  form: UseFormReturnType<FullCalendarEvent>;
};

export default function Subtasks({ form, mutation }: Props) {
  const [newItem, setNewItem] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 100,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = form.values.subtasks.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = form.values.subtasks.findIndex(
        (item) => item.id === over?.id
      );
      return form.reorderListItem("subtasks", {
        from: oldIndex,
        to: newIndex,
      });
    }
  }

  useEffect(() => {
    if (form.values.subtasks) {
      if (
        form.values.subtasks &&
        form.values.subtasks.length > 0 &&
        form.values.subtasks?.filter((t) => t.checked).length ===
          form.values.subtasks.length
      ) {
        mutation.mutate(true);
      }
    }
  }, [form.values.subtasks]);

  return (
    <div>
      <Group align="center">
        <TextInput
          flex={1}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              form.insertListItem("subtasks", {
                text: newItem,
                checked: false,
                id: Math.random().toString(36).substring(2),
              });
              setNewItem("");
            }
          }}
          placeholder="New subtask"
        />
        <ActionIcon
          onClick={() => {
            form.insertListItem("subtasks", {
              text: newItem,
              checked: false,
              id: Math.random().toString(36).substring(2),
            });
            setNewItem("");
          }}
        >
          <IconPlus />
        </ActionIcon>
      </Group>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={form.values.subtasks?.map((item) => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {form.values?.subtasks &&
            form.values?.subtasks.map((task, index) => {
              return (
                <Fragment key={task.id}>
                  <Subtask key={index} index={index} form={form} />
                </Fragment>
              );
            })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
