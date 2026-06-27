import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://16.208.59.201:8080/api",
  ios: "http://16.208.59.201:8080/api",
  default: "http://16.208.59.201:8080/api",
});

export const TUITION_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: TUITION_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const tuitionApi = {
  async getRequests({ teacherId, studentId } = {}) {
    try {
      const response = await apiClient.get("/tuition-request", {
        params: {
          teacherId,
          studentId,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load tuition requests"));
    }
  },

  async createRequest(payload) {
    try {
      const response = await apiClient.post("/tuition-request", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to send tuition request"));
    }
  },

  async acceptRequest(requestId, teacherId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/${requestId}/accept`,
        payload,
        { params: { teacherId } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to accept tuition request"));
    }
  },

  async declineRequest(requestId, teacherId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/${requestId}/decline`,
        payload,
        { params: { teacherId } }
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to decline tuition request"));
    }
  },

  async markViewed(requestId, role) {
    try {
      const response = await apiClient.put(`/tuition-request/${requestId}/view`, null, {
        params: { role },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update tuition request"));
    }
  },

  async getSessions({ teacherId, studentId } = {}) {
    try {
      const response = await apiClient.get("/tuition-request/sessions", {
        params: {
          teacherId,
          studentId,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load sessions"));
    }
  },

  async getTeacherSessions(teacherId) {
    try {
      const response = await apiClient.get("/tuition-request/sessions", {
        params: { teacherId },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load sessions"));
    }
  },

  async getStudentSessions(studentId) {
    try {
      const response = await apiClient.get("/tuition-request/sessions", {
        params: { studentId },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load sessions"));
    }
  },

  async createSession(payload) {
    try {
      const response = await apiClient.post("/tuition-request/sessions", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save session"));
    }
  },

  async updateSession(sessionId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/sessions/${sessionId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update session"));
    }
  },

  async saveSession(sessionId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/sessions/${sessionId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update session"));
    }
  },

  async completeSession(sessionId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/sessions/${sessionId}`,
        {
          ...payload,
          status: payload.status || "completed",
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update session"));
    }
  },

  async endSession(sessionId, payload = {}) {
    try {
      const response = await apiClient.put(
        `/tuition-request/sessions/${sessionId}`,
        {
          ...payload,
          status: payload.status || "completed",
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update session"));
    }
  },
};

export default tuitionApi;
