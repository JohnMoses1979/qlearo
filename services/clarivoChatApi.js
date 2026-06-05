import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://192.168.0.29:8085/api",
  ios: "http://192.168.0.29:8085/api",
  default: "http://192.168.0.29:8085/api",
});

export const CLARIVO_CHAT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: CLARIVO_CHAT_API_BASE_URL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const clarivoChatApi = {
  async getSessions({ userId, userRole }) {
    try {
      const response = await apiClient.get("/clarivo-chat/sessions", {
        params: { userId, userRole },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load chat history"));
    }
  },

  async getMessages(sessionId) {
    try {
      const response = await apiClient.get(`/clarivo-chat/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load chat messages"));
    }
  },

  async createSession(payload) {
    try {
      const response = await apiClient.post("/clarivo-chat/sessions", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to start a new chat"));
    }
  },

  async sendMessage(sessionId, payload) {
    try {
      const response = await apiClient.post(
        `/clarivo-chat/sessions/${sessionId}/messages`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to send chat message"));
    }
  },
};

export default clarivoChatApi;
