import { Box } from "@mantine/core";
import List from "./List";
import Lists from "./Lists";
import Planner from "./Planner";
import { useParams } from "react-router-dom";

export default function Backlog() {
  const { id } = useParams();
  const render = () => {
    if (!id) return <Lists />;
    if (id === "planner") return <Planner />;
    return <List />;
  };

  return <Box p="lg">{render()}</Box>;
}
