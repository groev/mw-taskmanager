import { Box, Tooltip } from "@mantine/core";

// Adding the missing CalendarEvent type
type CalendarEvent = {
  checked: boolean;
  subtasks?: {
    checked: boolean;
  }[];
};

type Props = {
  day: string;
  tasks: CalendarEvent[];
};

export default function Summary({ day, tasks }: Props) {
  const progress = tasks
    ?.filter((task) => task.type !== "ms")
    .reduce(
      (acc, task) => {
        if (task.subtasks?.length > 0) {
          acc.checked += task.subtasks.filter((t) => t.checked).length;
          acc.total += task.subtasks.length;
        }
        acc.checked += task.checked ? 1 : 0;
        acc.total += 1;

        return acc; // Return the accumulator for the next iteration
      },
      {
        checked: 0,
        total: 0,
      }
    ) || { checked: 0, total: 0 };

  const getColor = (percentage: number) => {
    if (percentage < 25) return "red";
    if (percentage < 50) return "orange";
    if (percentage < 75) return "yellow";
    return "green";
  };

  const totalHours = tasks?.reduce((acc, task) => {
    const hours = task.endSlot - task.startSlot;
    return acc + (hours || 0);
  }, 0);

  const totalSubTasks = tasks?.reduce((acc, task) => {
    return acc + (task.subtasks?.length > 0 ? 1 : 0);
  }, 0);

  const score = {
    totalHours: (totalHours / 62) * 30,
    totalSubTasks: (totalSubTasks / 5) * 15,
    progress: (progress.checked / progress.total) * 55,
  };

  const percentage =
    Math.round(
      (score.totalHours > 30 ? 30 : score.totalHours) +
        (score.totalSubTasks > 15 ? 15 : score.totalSubTasks) +
        score.progress
    ) || 0;

  return (
    <Tooltip label={JSON.stringify(score)}>
      <Box
        fw="bold"
        c="white"
        p="xs"
        fz="xs"
        ta="center"
        color="white"
        bg={getColor(percentage)}
      >
        {percentage}%
      </Box>
    </Tooltip>
  );
}
