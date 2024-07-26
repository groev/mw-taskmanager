import { TextInput } from "@mantine/core";

type Props = {};

export default function AddTask({}: Props) {
  return (
    <div>
      <TextInput placeholder="Add task" size="xs" />
    </div>
  );
}
