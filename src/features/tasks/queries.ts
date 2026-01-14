import { createSessionClient } from "@/src/lib/appwrite";

import { DATABASE_ID, TASKS_ID } from "@/src/config";
import { Task } from "./types";

interface GetTaskProps {
  taskId: string;
}

export const GetTask = async ({ taskId }: GetTaskProps) => {
  try {
    const { databases } = await createSessionClient();

    // const user = await account.get();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );

    return task;
  } catch {
    return null;
  }
};
