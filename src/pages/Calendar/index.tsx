import "./fullcalendar.overrides.css";

import Backlog from "./Backlog/index";
import { Box } from "@mantine/core";
import EventForm from "./Eventform";
import Grid from "./Grid";
import Keybindings from "./Keybindings";

export default function Calendar() {
  return (
    <Box pos="relative" display="flex" h={"calc(100vh)"}>
      <Box visibleFrom="xs" w={325}>
        <Backlog />
      </Box>
      <div
        style={{
          position: "relative",
          flex: 1,
          height: "calc(100vh)",
          overflow: "hidden",
          borderLeft: "1px solid var(--mantine-color-dark-5)",
          paddingBottom: "73px",
        }}
      >
        <EventForm />
        <Box h="100%" w="100%" style={{ overflowY: "auto" }}>
          <Grid />
        </Box>
      </div>
      <Keybindings />
    </Box>
  );
}
