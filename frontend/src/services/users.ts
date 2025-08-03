import createApiClient from "./api";

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface UserInput {
  username: string;
  email: string;
  password?: string;
  is_staff: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  const api = createApiClient();
  const response = await api.get("/users/");
  return response.data;
};

export const createUser = async (userData: UserInput): Promise<User> => {
  const api = createApiClient();
  const response = await api.post("/users/", userData);
  return response.data;
};

export const updateUser = async (
  id: number,
  userData: UserInput
): Promise<User> => {
  const api = createApiClient();
  const response = await api.put(`/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  const api = createApiClient();
  await api.delete(`/users/${id}/`);
};
