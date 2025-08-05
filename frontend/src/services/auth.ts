import createApiClient from "./api";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: object;
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

export const getCurrentUser = async (): Promise<User> => {
  const api = createApiClient();
  const response = await api.get<User>("/current-user/");
  return response.data;
};
