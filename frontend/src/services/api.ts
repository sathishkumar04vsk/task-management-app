import axios, { AxiosInstance } from "axios";
import { Auth } from "../store/auth";

const createApiClient = (): AxiosInstance => {
  const token = Auth.getToken();
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return api;
};

export default createApiClient;
