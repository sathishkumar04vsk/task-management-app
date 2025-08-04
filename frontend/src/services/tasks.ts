import createApiClient from "./api";

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  assigned_to: { id: number; username: string } | null;
}

export interface TaskInput {
  title: string;
  description: string;
  due_date: string;
  priority: string;
  assigned_to_id?: number | null;
  status?: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const api = createApiClient();
  const response = await api.get<Task[]>("/tasks/");
  return response.data;
};

export const createTask = async (taskData: TaskInput): Promise<Task> => {
  const api = createApiClient();
  const response = await api.post<Task>("/tasks/", taskData);
  return response.data;
};

export const updateTask = async (
  id: number,
  taskData: TaskInput
): Promise<Task> => {
  const api = createApiClient();
  const response = await api.put<Task>(`/tasks/${id}/`, taskData);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  const api = createApiClient();
  await api.delete(`/tasks/${id}/`);
};
