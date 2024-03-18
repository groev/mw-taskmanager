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

import classes from "./lists.module.css";

export default function Page() {
  const [lists, setLists] = useState<List[]>([]);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "lists"),
        where("user", "==", auth.currentUser?.uid)
      ),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as List)
        );
        setLists(data);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <Container>
      <Group mt="xl" align="center" justify="space-between">
        <Title size="1.5rem">Lists</Title>
        <Button
          variant="outline"
          leftSection={<IconPlus />}
          component={Link}
          to="/lists/create"
        >
          Create List
        </Button>
      </Group>
      <Grid mt="xl">
        {lists.map((list) => (
          <Grid.Col key={list.id} span={{ sm: 6, md: 4, xl: 4 }}>
            <Link className={classes.listLink} to={`/lists/${list.id}`}>
              <Card withBorder>
                <Title fw={500} order={4}>
                  {list.title}
                </Title>
                <Text fz="sm" c="dimmed">
                  {list.items.length} items
                </Text>
              </Card>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
