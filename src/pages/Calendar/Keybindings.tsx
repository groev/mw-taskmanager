import KeyBinding from "react-keybinding-component";

import { deleteEvent } from "./helpers";
import { useCalendarStore } from "./store";

export default function Keybindings() {
  const selectedEvent = useCalendarStore((state) => state.selectedEvent);
  const changeDay = useCalendarStore((state) => state.changeDay);

  return (
    <>
      <KeyBinding
        onKey={(e) => {
          switch (e.code) {
            case "Delete":
              if (selectedEvent?.id) deleteEvent(selectedEvent.id);
              break;
            case "ArrowLeft":
              changeDay(-1);
              break;
            case "ArrowRight":
              changeDay(1);
              break;
          }
        }}
        type="keydown"
        target={window}
      />
    </>
  );
}
