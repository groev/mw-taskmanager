import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Formik, Form, Field, FieldProps } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Title,
  Group,
  ActionIcon,
  Loader,
  Popover,
  Container,
  Text,
} from "@mantine/core";
import { TextInput } from "@mantine/core";
import { IconCheck, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Editor from "@/components/Editor";

import { db, auth } from "@/firebase";
import { Doc } from "@/types/doc";

export default function Page() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "create";

  type ValueProps = {
    title: string;
    content: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
  };

  const [initialValues, setInitialValues] = useState<ValueProps>({
    title: "",
    content: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["document", id],
    retry: false,
    queryFn: async () => {
      if (id === "create" || !id) return null;
      const docRef = doc(db, "documents", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Doc;
      } else {
        return navigate("/documents");
      }
    },
  });

  useEffect(() => {
    if (data) {
      setInitialValues(data);
    }
  }, [data]);

  const saveDocument = useMutation({
    mutationFn: async (values: ValueProps) => {
      if (!id) return;
      const listToInsert = {
        ...values,
        user: auth.currentUser?.uid,
        updated_at: new Date(),
      };
      const docRef = doc(db, "documents", id);

      await setDoc(docRef, listToInsert);
      refetch();
      return;
    },
  });

  const createDocument = useMutation({
    mutationFn: async (values: ValueProps) => {
      const documentToInsert = {
        ...values,
        user: auth.currentUser?.uid,
        created_at: new Date(),
      };

      const doc = await addDoc(collection(db, "documents"), documentToInsert);
      navigate(`/documents/${doc.id}`);
      return;
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const docRef = doc(db, "documents", id);
      return await deleteDoc(docRef);
    },
    onSuccess: () => {
      navigate("/documents");
    },
  });

  return (
    <Container size="md">
      {isLoading && <Loader />}
      <Formik
        enableReinitialize
        onSubmit={(values) =>
          isNew ? createDocument.mutate(values) : saveDocument.mutate(values)
        }
        initialValues={initialValues}
      >
        {() => {
          return (
            <Form>
              <Group my="xl" align="center" justify="space-between">
                <Title size="1.5rem">
                  {id === "create" ? "Create new document" : "Edit document"}
                </Title>{" "}
                <Group gap={"xs"}>
                  {!isNew && (
                    <>
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
                            loading={deleteDocument.isPending}
                          >
                            <IconTrash />{" "}
                          </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Button
                            type="button"
                            onClick={() => deleteDocument.mutate()}
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
                  {isNew ? (
                    <Button
                      type="submit"
                      variant="primary"
                      color="blue"
                      loading={createDocument.isPending}
                      leftSection={<IconDeviceFloppy />}
                    >
                      Create document
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      color="blue"
                      loading={saveDocument.isPending}
                      leftSection={<IconDeviceFloppy />}
                    >
                      Save document
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
              <Field name="content">
                {({ field }: FieldProps) => (
                  <>
                    <Editor
                      value={field.value}
                      onChange={(value: string) => {
                        field.onChange({
                          target: {
                            name: "content",
                            value: value,
                          },
                        });
                      }}
                    />
                  </>
                )}
              </Field>
            </Form>
          );
        }}
      </Formik>
      <Group gap="xs" mt="xl">
        {!isNew && (
          <Text fz="xs" c="dimmed">
            Created at:{" "}
            {initialValues.created_at?.toDate().toLocaleDateString("de-DE") +
              " " +
              initialValues.created_at?.toDate().toLocaleTimeString("de-DE")}
          </Text>
        )}
        {initialValues.updated_at && "|"}
        {initialValues.updated_at && (
          <Text fz="xs" c="dimmed">
            Udpated at:{" "}
            {initialValues.updated_at?.toDate().toLocaleDateString("de-DE") +
              " " +
              initialValues.updated_at?.toDate().toLocaleTimeString("de-DE")}
          </Text>
        )}
      </Group>
    </Container>
  );
}
