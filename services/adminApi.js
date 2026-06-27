import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://16.208.59.201:8080/api",
  ios: "http://16.208.59.201:8080/api",
  default: "http://16.208.59.201:8080/api",
});

export const ADMIN_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  const rawMessage =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.title ||
    data?.reason ||
    (typeof data === "string" ? data : "") ||
    error?.message ||
    fallback;

  if (status === 401) {
    return "Invalid admin email or password.";
  }

  return rawMessage;
};

export const adminApi = {
  async login(payload) {
    try {
      const response = await apiClient.post("/admin/login", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to login"));
    }
  },
};

export default apiClient;
