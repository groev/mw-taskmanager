import { useParams, Link } from "react-router-dom";

import { Box, Text, Group, ActionIcon, Loader, Stack } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

import useList from "@/pages/List/hooks/useList";

import { useCalendarStore } from "../store";
import ListItem from "./ListItem";

export default function List() {
  const { id = "" } = useParams();
  const events = useCalendarStore((state) => state.events);
  const { data, isLoading } = useList(id);
  return (
    <Box>
      {isLoading && <Loader />}
      <Group mb="sm">
        <ActionIcon variant="subtle" component={Link} to="/backlog" size="xs">
          <IconChevronLeft />
        </ActionIcon>
        <Text fz="sm" fw="bold">
          {data?.title}{" "}
        </Text>
      </Group>
      <Stack gap={4}>
        {data?.items
          ?.filter((item) => !events.find((event) => event.msid === item.id))
          .map((item) => (
            <ListItem key={item.id} item={item} />
          ))}
        {data?.items
          ?.filter((item) => events.find((event) => event.msid == item.id))
          .map((item) => (
            <ListItem key={item.id} item={item} disabled />
          ))}
      </Stack>
    </Box>
  );
}
