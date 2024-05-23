import KeyBinding from "react-keybinding-component";

import { useCalendarStore } from "./store";

export default function Keybindings() {
  const changeDay = useCalendarStore((state) => state.changeDay);

  return (
    <>
      <KeyBinding
        onKey={(e) => {
          switch (e.code) {
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
