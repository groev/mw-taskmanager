import { Box } from "@mantine/core";

import Backlog from "./Backlog";
import EventForm from "./Eventform";
import Grid from "./Grid";

import Keybindings from "./Keybindings";

import "./fullcalendar.overrides.css";

export default function Calendar() {
  return (
    <Box pos="relative" display="flex" h={"calc(100vh - 50px)"}>
      <Box
        visibleFrom="xs"
        w={325}
        style={{
          borderRight: "1px solid var(--mantine-color-dark-5)",
          overflowY: "auto",
        }}
      >
        <Backlog />
      </Box>
      <div style={{ position: "relative", flex: 1 }}>
        <EventForm />

        <Grid />
      </div>
      <Keybindings />
    </Box>
  );
}
