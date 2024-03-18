import { Box } from "@mantine/core";

import EventForm from "./Eventform";
import Grid from "./Grid";
import Keybindings from "./Keybindings";

import "./fullcalendar.overrides.css";

export default function Calendar() {
  return (
    <Box pos="relative">
      <Grid />
      <Keybindings />
      <EventForm />
    </Box>
  );
}
