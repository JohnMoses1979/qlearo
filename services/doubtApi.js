import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://192.168.0.29:8085/api",
  ios: "http://192.168.0.29:8085/api",
  default: "http://192.168.0.29:8085/api",
});

export const DOUBT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: DOUBT_API_BASE_URL,
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

export const doubtApi = {
  async submitDoubt(studentId, payload) {
    try {
      const response = await apiClient.post(`/doubts/students/${studentId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to submit doubt"));
    }
  },

  async getStudentDoubts(studentId) {
    try {
      const response = await apiClient.get(`/doubts/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load doubts"));
    }
  },

  async getTeacherDoubts(teacherId) {
    try {
      const response = await apiClient.get(`/doubts/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load doubts"));
    }
  },

  async acceptDoubt(teacherId, doubtId, payload) {
    try {
      const response = await apiClient.post(`/doubts/teachers/${teacherId}/${doubtId}/accept`, payload || {});
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to accept doubt"));
    }
  },

  async answerDoubt(teacherId, doubtId, payload) {
    try {
      const response = await apiClient.post(`/doubts/teachers/${teacherId}/${doubtId}/answer`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to submit answer"));
    }
  },

  async getNotifications(recipientRole, recipientId) {
    try {
      const response = await apiClient.get(`/doubts/notifications/${recipientRole}/${recipientId}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load notifications"));
    }
  },

  async getUnreadNotificationCount(recipientRole, recipientId) {
    try {
      const response = await apiClient.get(
        `/doubts/notifications/${recipientRole}/${recipientId}/unread-count`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load notification count"));
    }
  },

  async markNotificationRead(recipientRole, recipientId, notificationId) {
    try {
      const response = await apiClient.post(
        `/doubts/notifications/${recipientRole}/${recipientId}/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to mark notification as read"));
    }
  },

  async createNotification(payload) {
    try {
      const response = await apiClient.post("/doubts/notifications", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to create notification"));
    }
  },
};

export default doubtApi;
