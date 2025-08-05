import createApiClient from "./api";

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role?: {
    id: string;
    name: string;
  };
  role_id?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const api = createApiClient();
  const response = await api.get("/users/");
  return response.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const api = createApiClient();
  const response = await api.post("/users/", userData);
  return response.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const api = createApiClient();
  const response = await api.put(`/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  const api = createApiClient();
  await api.delete(`/users/${id}/`);
};
