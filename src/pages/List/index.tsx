import { useEffect, useState, useRef, Fragment } from "react";
import {
  addDoc,
  collection,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Formik,
  Form,
  Field,
  FieldArray,
  FieldArrayRenderProps,
  FieldProps,
} from "formik";
import ClickAwayListener from "react-click-away-listener";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Card,
  Title,
  Group,
  Checkbox,
  ActionIcon,
  Loader,
  Popover,
  Container,
  Box,
} from "@mantine/core";
import { TextInput } from "@mantine/core";
import {
  IconCheck,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { useMutation, useQuery } from "@tanstack/react-query";

import { db, auth } from "@/firebase";

export default function Page() {
  const [newItem, setNewItem] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "create";

  const [initialValues, setInitialValues] = useState<List>({
    title: "",
    items: [],
    id: "",
    user: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["list", id],
    retry: false,
    queryFn: async () => {
      if (isNew) return null;
      if (!id) return navigate("/lists");
      const docRef = doc(db, "lists", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const items = docSnap.data()?.items || [];
        const fetchedList = {
          id: docSnap.id,
          ...docSnap.data(),
          items: items.map((item: ListItem) => ({
            ...item,
            id: item.id || Math.random().toString(36).substring(2),
          })),
        };

        return fetchedList as List;
      } else {
        return navigate("/lists");
      }
    },
  });

  useEffect(() => {
    if (data) {
      setInitialValues(data);
    }
  }, [data]);

  const saveList = useMutation({
    mutationFn: async (values: List) => {
      if (!auth.currentUser?.uid) return;
      const listToUpdate = values;
      listToUpdate.user = auth.currentUser.uid;
      if (!id) return;
      const docRef = doc(db, "lists", id);
      delete listToUpdate?.id;
      await setDoc(docRef, listToUpdate);
      setInitialValues(listToUpdate);

      return refetch();
    },
  });

  const createList = useMutation({
    mutationFn: async (values: List) => {
      if (!auth.currentUser?.uid) return;
      const listToInsert = values;
      listToInsert.user = auth.currentUser?.uid;
      const doc = await addDoc(collection(db, "lists"), listToInsert);
      navigate(`/lists/${doc.id}`);
      return refetch();
    },
  });

  const deleteList = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const docRef = doc(db, "lists", id);
      return await deleteDoc(docRef);
    },
    onSuccess: () => {
      navigate("/lists");
    },
  });

  const clearList = (values: List) => {
    // set all items to unchecked
    const clearedItems = values.items.map((item) => ({
      ...item,
      checked: false,
    }));
    setInitialValues({ ...values, items: clearedItems });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 250,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Container mt="xl" size="sm">
      {isLoading && <Loader />}
      <Formik
        enableReinitialize
        onSubmit={(values) => {
          isNew ? createList.mutate(values) : saveList.mutate(values);
        }}
        initialValues={initialValues}
      >
        {({ values, dirty }) => {
          return (
            <Form>
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
                        onClick={() => clearList(values)}
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
                  {!isNew && dirty && (
                    <Button
                      type="submit"
                      variant="outline"
                      loading={saveList.isPending}
                      leftSection={<IconDeviceFloppy />}
                    >
                      Save list
                    </Button>
                  )}
                </Group>
              </Group>
              <Field
                size="xl"
                mb="xl"
                name="title"
                as={TextInput}
                label="Title"
              />
              <FieldArray
                name="items"
                render={(arrayHelpers) => {
                  const handleDragEnd = (event: DragEndEvent) => {
                    const { active, over } = event;
                    if (active.id !== over?.id) {
                      const oldIndex = values.items.findIndex(
                        (item) => item.id === active.id
                      );
                      const newIndex = values.items.findIndex(
                        (item) => item.id === over?.id
                      );
                      return arrayHelpers.move(oldIndex, newIndex);
                    }
                  };
                  return (
                    <div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={values.items?.map((item) => item.id) || []}
                          strategy={verticalListSortingStrategy}
                        >
                          {values.items?.map((item, index) => (
                            <Fragment key={item.id}>
                              <ListItem
                                values={values}
                                key={item.id}
                                arrayHelpers={arrayHelpers}
                                index={index}
                              />
                            </Fragment>
                          ))}
                        </SortableContext>
                      </DndContext>
                      <Group my="xl">
                        <TextInput
                          value={newItem}
                          flex={1}
                          onChange={(e) => setNewItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newItem === "") return;
                              arrayHelpers.push({
                                id: Math.random().toString(36).substring(2),
                                title: newItem,
                                checked: false,
                              });
                              return setNewItem("");
                            }
                          }}
                        ></TextInput>
                        <Button
                          type="button"
                          variant="outline"
                          leftSection={<IconPlus />}
                          onClick={() => {
                            if (newItem === "") return;
                            arrayHelpers.push({
                              id: Math.random().toString(36).substring(2),

                              title: newItem,
                              checked: false,
                            });
                            return setNewItem("");
                          }}
                        >
                          Add item
                        </Button>
                      </Group>
                    </div>
                  );
                }}
              />
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
}

type ListItemProps = {
  arrayHelpers: FieldArrayRenderProps;
  index: number;
  values: List;
};

const ListItem = ({ arrayHelpers, index, values }: ListItemProps) => {
  const [isEditAble, setIsEditAble] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: values.items[index].id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          <Field type="checkbox" name={`items.${index}.checked`}>
            {({ field }: FieldProps) => (
              <Checkbox
                radius="50%"
                size="md"
                {...field}
                onChange={(e) => {
                  arrayHelpers.replace(index, {
                    ...values.items[index],
                    checked: e.target.checked,
                  });
                }}
              />
            )}
          </Field>
          <Box flex={1} onClick={() => setIsEditAble(true)}>
            <Field w={"100%"} flex={1} mt="" name={`items[${index}].title`}>
              {({ field }: FieldProps) => (
                <TextInput
                  style={{
                    pointerEvents: "auto",
                    textDecoration: values.items[index].checked
                      ? "line-through"
                      : "none",
                  }}
                  variant={isEditAble ? "filled" : "unstyled"}
                  {...field}
                  ref={ref}
                  placeholder="Item title"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setIsEditAble(false);
                      }
                    }
                  }}
                />
              )}
            </Field>
          </Box>
          {isEditAble && (
            <ActionIcon
              variant="transparent"
              onClick={() => arrayHelpers.remove(index)}
            >
              <IconTrash />
            </ActionIcon>
          )}
        </Group>
      </Card>
    </ClickAwayListener>
  );
};
