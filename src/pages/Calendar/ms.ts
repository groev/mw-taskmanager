import buildQuery from "odata-query";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

async function fetchTasks(msToken: string | null) {
  if (!msToken) return [];

  const query = buildQuery({
    filter: {
      completedDateTime: {
        ne: null,
      },
      percentComplete: {
        ne: 100,
      },
    },
  });

  const url = `https://graph.microsoft.com/v1.0/me/planner/tasks${query}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + msToken,
      },
    });

    const data = await res.json();
    const tasks = data.value as MicrosoftGraph.PlannerTask[];
    console.log(tasks);
    return tasks.filter(
      (task) => !task.percentComplete || task.percentComplete < 100
    );
  } catch (err) {
    return [];
  }
}

export { fetchTasks };
