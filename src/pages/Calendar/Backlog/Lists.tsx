import { Link } from "react-router-dom";

import { Stack, Button, Loader, Group, Text } from "@mantine/core";

import { IconBrandTeams, IconChevronRight } from "@tabler/icons-react";

import { useAuthContext } from "@/context/AuthContext";
import useLists from "@/pages/List/hooks/useLists";

export default function Lists() {
  const { data, isLoading } = useLists();
  const { msToken } = useAuthContext();

  return (
    <Stack gap={4}>
      <Group mb="sm">
        <Text fz="sm" fw="bold">
          My Lists
        </Text>
      </Group>
      {isLoading && <Loader />}
      {msToken && (
        <Button
          color="green"
          component={Link}
          to="/backlog/planner"
          variant="light"
          p="sm"
          justify="space-between"
          rightSection={<IconChevronRight size="1rem" />}
        >
          <Group gap="xs">
            <IconBrandTeams size="1rem" /> Planner Tasks
          </Group>
        </Button>
      )}
      {data?.map((list) => (
        <Button
          component={Link}
          to={`/backlog/${list.id}`}
          variant="light"
          p="sm"
          justify="space-between"
          key={list.id}
          rightSection={<IconChevronRight size="1rem" />}
        >
          {list.title}
        </Button>
      ))}
    </Stack>
  );
}
