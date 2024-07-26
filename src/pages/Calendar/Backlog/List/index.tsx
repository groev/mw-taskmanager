import { ActionIcon, Box, Group, Loader, Text } from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FormProvider, useForm } from "./formContext";
import { Fragment, useEffect, useState } from "react";
import { IconChevronLeft, IconPlus } from "@tabler/icons-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Link } from "react-router-dom";
import ListItem from "./Listitem";
import { TextInput } from "@mantine/core";
import { auth } from "@/firebase";
import useCreateList from "./hooks/useCreateList";
import { useDebouncedCallback } from "@mantine/hooks";
import useDeleteList from "./hooks/useDeleteList";
import useList from "./hooks/useList";
import { useParams } from "react-router-dom";
import useUpdateList from "./hooks/useUpdateList";

export default function Page() {
  const [newItem, setNewItem] = useState("");
  const { id = "" } = useParams();
  const isNew = id === "create";

  const { data, isLoading } = useList(id);

  const saveList = useUpdateList(id);
  const createList = useCreateList();

  const deleteList = useDeleteList(id);

  const clearList = () => {
    // set all items to unchecked
    const clearedItems = form.getValues().items.map((item) => ({
      ...item,
      checked: false,
    }));
    form.setFieldValue("items", clearedItems);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 100,
      },
    })
  );

  const form = useForm({
    initialValues: {
      title: "",
      items: [],
      user: auth.currentUser?.uid || "",
    },
    onValuesChange() {
      submitFormOnChange();
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const addNewItem = () => {
    newItem === "" ||
      form.insertListItem(
        "items",
        {
          id: Math.random().toString(36).substring(2),

          title: newItem,
          checked: false,
        },
        0
      );
    setNewItem("");
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = form
        .getValues()
        .items.findIndex((item) => item.id === active.id);
      const newIndex = form
        .getValues()
        .items.findIndex((item) => item.id === over?.id);
      return form.reorderListItem("items", {
        from: oldIndex,
        to: newIndex,
      });
    }
  }

  const submitForm = (values: List) => {
    if (id === "create") {
      createList.mutate(values);
    } else {
      saveList.mutate(values);
    }
  };

  const submitFormOnChange = useDebouncedCallback(() => {
    submitForm(form.getValues());
  }, 1000);

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit((values) => submitForm(values))}>
        {isLoading && <Loader />}
        <Group>
          <ActionIcon variant="subtle" component={Link} to="/backlog" size="xs">
            <IconChevronLeft />
          </ActionIcon>
          <Text fz="sm" fw="bold">
            {form.values.title}
          </Text>
        </Group>
        <Box mb="xl">
          <Group my="xl">
            <TextInput
              value={newItem}
              flex={1}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  return addNewItem();
                }
              }}
            ></TextInput>
            <ActionIcon
              type="button"
              variant="outline"
              onClick={() => {
                return addNewItem();
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
              items={form.getValues().items?.map((item) => item.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {form.getValues().items?.map((item, index) => (
                <Fragment key={item.id}>
                  <ListItem key={item.id} index={index} />
                </Fragment>
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      </form>
    </FormProvider>
  );
}
