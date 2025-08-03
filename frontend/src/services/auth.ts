import createApiClient from "./api";

interface LoginResponse {
  access: string;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const api = createApiClient();
  const response = await api.post("/token/", { username, password });
  return response.data;
};

export const getCurrentUser = async (
  username: string
): Promise<{ is_staff: boolean }> => {
  const api = createApiClient();
  const response = await api.get("/users/");
  const user = response.data.find((u: any) => u.username === username);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
