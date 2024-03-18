import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Grid,
  Group,
  Title,
  Text,
  Container,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { db, auth } from "@/firebase";

import { Doc } from "@/types/doc";

export default function Page() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(
      query(
        collection(db, "documents"),
        where("user", "==", auth.currentUser.uid)
      ),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as Doc)
        );
        setDocuments(data);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <Container>
      <Group my="xl" align="center" justify="space-between">
        <Title size="1.5rem">Documents</Title>
        <Button
          variant="outline"
          leftSection={<IconPlus />}
          component={Link}
          to="/documents/create"
        >
          Create document
        </Button>
      </Group>
      <Grid>
        {documents.map((document) => (
          <Grid.Col key={document.id} span={{ sm: 6, md: 4, xl: 4 }}>
            <Link
              style={{ textDecoration: "none" }}
              to={`/documents/${document.id}`}
            >
              <Card withBorder>
                <Title fw={500} order={4}>
                  {document.title}
                </Title>
                <Text fz="sm" c="dimmed">
                  {document?.created_at?.toDate().toLocaleDateString("de-DE")} |{" "}
                  {document?.content?.length} words
                </Text>
              </Card>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
