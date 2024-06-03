import { useEffect, useState, Fragment } from "react";

import { useParams } from "react-router-dom";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Title,
  Group,
  ActionIcon,
  Loader,
  Popover,
  Container,
  Box,
} from "@mantine/core";

import { TextInput } from "@mantine/core";

import { useDebouncedCallback } from "@mantine/hooks";

import {
  IconCheck,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { auth } from "@/firebase";

import { FormProvider, useForm } from "./formContext";
import useCreateList from "./hooks/useCreateList";

import useDeleteList from "./hooks/useDeleteList";

import useList from "./hooks/useList";
import useUpdateList from "./hooks/useUpdateList";
import ListItem from "./Listitem";

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
        <Container mt="xl" size="sm">
          {isLoading && <Loader />}

          <Group mb="xl" align="center" justify="space-between">
            <Title size="1.5rem">
              {id === "create" ? "Create new list" : "Edit list"}
            </Title>{" "}
            <Group gap={"xs"}>
              {!isNew && (
                <>
                  <ActionIcon
                    type="button"
                    color="green"
                    variant="outline"
                    size="lg"
                    onClick={() => clearList()}
                  >
                    <IconX />
                  </ActionIcon>
                  <Popover
                    width={300}
                    trapFocus
                    position="bottom"
                    withArrow
                    shadow="md"
                  >
                    <Popover.Target>
                      <ActionIcon
                        type="button"
                        color="red"
                        variant="outline"
                        size="lg"
                        loading={deleteList.isPending}
                      >
                        <IconTrash />{" "}
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Button
                        type="button"
                        onClick={() => deleteList.mutate()}
                        color="red"
                        w={"100%"}
                        variant="outline"
                        leftSection={<IconCheck />}
                      >
                        {"I'm sure"}
                      </Button>
                    </Popover.Dropdown>
                  </Popover>
                </>
              )}
              {isNew && (
                <Button
                  type="submit"
                  variant="outline"
                  loading={createList.isPending}
                  leftSection={<IconDeviceFloppy />}
                >
                  Create List
                </Button>
              )}
            </Group>
          </Group>
          <TextInput
            size="xl"
            mb="xl"
            name="title"
            label="Title"
            {...form.getInputProps("title")}
          />

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
              <Button
                type="button"
                variant="outline"
                leftSection={<IconPlus />}
                onClick={() => {
                  return addNewItem();
                }}
              >
                Add item
              </Button>
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
        </Container>
      </form>
    </FormProvider>
  );
}
