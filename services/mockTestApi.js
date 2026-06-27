import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://16.208.59.201:8080/api",
  ios: "http://16.208.59.201:8080/api",
  default: "http://16.208.59.201:8080/api",
});

export const MOCK_TEST_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: MOCK_TEST_API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const mockTestApi = {
  async getCatalog() {
    try {
      const response = await apiClient.get("/mock-tests/catalog");
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load mock test catalog"));
    }
  },

  async getTeacherCatalog(teacherId) {
    try {
      const response = await apiClient.get(
        `/teachers/${teacherId}/mock-tests/catalog`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load teacher mock test catalog"));
    }
  },

  async createCategory(teacherId, payload) {
    try {
      const response = await apiClient.post(
        `/teachers/${teacherId}/mock-tests/categories`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to create mock test category"));
    }
  },

  async createSubject(teacherId, categoryTitle, payload) {
    try {
      const response = await apiClient.post(
        `/teachers/${teacherId}/mock-tests/categories/${encodeURIComponent(categoryTitle)}/subjects`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to create mock test subject"));
    }
  },

  async saveTest(teacherId, payload) {
    try {
      const response = await apiClient.post(
        `/teachers/${teacherId}/mock-tests/tests`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save mock test"));
    }
  },

  async deleteTest(teacherId, testId) {
    try {
      await apiClient.delete(
        `/teachers/${teacherId}/mock-tests/tests/${encodeURIComponent(testId)}`
      );
      return true;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to delete mock test"));
    }
  },

  async getTest(testId) {
    try {
      const response = await apiClient.get(
        `/mock-tests/${encodeURIComponent(testId)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load mock test"));
    }
  },

  async getTeacherAttempts(teacherId, params = {}) {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          searchParams.append(key, value);
        }
      });

      const query = searchParams.toString();
      const response = await apiClient.get(
        `/teachers/${teacherId}/mock-tests/attempts${query ? `?${query}` : ""}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load mock test attempts"));
    }
  },

  async saveAttempt(studentId, payload) {
    try {
      const response = await apiClient.post(
        `/students/${studentId}/mock-tests/attempts`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save test result"));
    }
  },

  async getStudentResults(studentId) {
    try {
      const response = await apiClient.get(
        `/students/${studentId}/mock-tests/results`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load test results"));
    }
  },

  async getStudentNotifications(studentId) {
    try {
      const response = await apiClient.get(
        `/students/${studentId}/notifications`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load notifications"));
    }
  },

  async markStudentNotificationRead(studentId, notificationId) {
    try {
      const response = await apiClient.post(
        `/students/${studentId}/notifications/${encodeURIComponent(notificationId)}/read`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to mark notification as read"));
    }
  },

  async getUnreadNotificationCount(studentId) {
    try {
      const response = await apiClient.get(
        `/students/${studentId}/notifications/unread-count`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load notification count"));
    }
  },
};

export default mockTestApi;
