import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Formik, Form, Field, FieldArray } from "formik";
import { useNavigate, useParams } from "react-router-dom";
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
  const [itemToEdit, setItemToEdit] = useState<number | null>(null);
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
        const fetchedList = {
          id: docSnap.id,
          ...docSnap.data(),
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
                render={(arrayHelpers) => (
                  <div>
                    {values.items?.map((_, index) => (
                      <Card withBorder p="xs" mt="xs" key={index}>
                        <Group>
                          <ActionIcon
                            variant="transparent"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            <IconTrash />
                          </ActionIcon>
                          {}
                          <Box flex={1} onClick={() => setItemToEdit(index)}>
                            <Field
                              w={"100%"}
                              flex={1}
                              mt=""
                              name={`items[${index}].title`}
                              as={TextInput}
                              style={{
                                pointerEvents: "auto",
                                textDecoration: values.items[index].checked
                                  ? "line-through"
                                  : "none",
                              }}
                              variant={
                                itemToEdit === index ? "filled" : "unstyled"
                              }
                              onKeyDown={(e: React.KeyboardEvent) => {
                                {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    setItemToEdit(null);
                                  }
                                }
                              }}
                            />
                          </Box>
                          <Field
                            type="checkbox"
                            name={`items.${index}.checked`}
                            as={Checkbox}
                          />
                        </Group>
                      </Card>
                    ))}
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
                )}
              />
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
}
