import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Stack,
  Loader,
  TextInput,
  Group,
  ActionIcon,
  Text,
} from "@mantine/core";

import { PlannerTask } from "@microsoft/microsoft-graph-types";
import { IconSearch } from "@tabler/icons-react";

import { IconChevronLeft } from "@tabler/icons-react";

import { useQuery } from "@tanstack/react-query";

import { useAuthContext } from "@/context/AuthContext";

import {} from "../helpers";
import { fetchTasks } from "../ms";
import { useCalendarStore } from "../store";
import TaskItem from "./PlannerTask";

export default function Backlog() {
  const { msToken } = useAuthContext();
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["msTasks", msToken],
    enabled: !!msToken,
    queryFn: async () => await fetchTasks(msToken),
  });
  const events = useCalendarStore((state) => state.events);

  const tasks = useMemo(() => {
    if (!data) return [];
    return data?.filter((task: PlannerTask) => {
      if (searchValue === "") return true;
      return task?.title?.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [data, searchValue]);

  return (
    <Stack p="xs" gap={2}>
      <Group mb="sm">
        <ActionIcon variant="subtle" component={Link} to="/backlog" size="xs">
          <IconChevronLeft />
        </ActionIcon>
        <Text fz="sm" fw="bold">
          Planner Tasks
        </Text>
      </Group>
      <TextInput
        size="xs"
        mb="md"
        variant="default"
        leftSection={<IconSearch size="1rem" />}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search"
      />
      {isLoading && <Loader />}
      {tasks
        ?.filter((task) => !events.find((event) => event.msid === task.id))
        .map((task) => (
          <TaskItem key={task.id} item={task} />
        ))}
      {tasks
        ?.filter((task) => events.find((event) => event.msid === task.id))
        .map((task) => (
          <TaskItem key={task.id} item={task} disabled />
        ))}
    </Stack>
  );
}
