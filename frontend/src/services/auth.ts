import createApiClient from "./api";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const api = createApiClient();
  const response = await api.post<LoginResponse>("/token/", {
    username,
    password,
  });
  return response.data;
};

export const refreshToken = async (
  refresh: string
): Promise<{ access: string }> => {
  const api = createApiClient();
  const response = await api.post<{ access: string }>("/token/refresh/", {
    refresh,
  });
  return response.data;
};

export const getCurrentUser = async (username: string): Promise<User> => {
  const api = createApiClient();
  const response = await api.get<User[]>("/users/");
  const user = response.data.find((u) => u.username === username);
  if (!user) throw new Error("User not found");
  return user;
};
