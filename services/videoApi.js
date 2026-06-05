import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://192.168.0.29:8085/api",
  ios: "http://192.168.0.29:8085/api",
  default: "http://192.168.0.29:8085/api",
});


export const VIDEO_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: VIDEO_API_BASE_URL,
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

export const videoApi = {
  async getCategories() {
    try {
      const response = await apiClient.get("/videos/categories");
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load video categories"));
    }
  },

  async getVideos() {
    try {
      const response = await apiClient.get("/videos");
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load videos"));
    }
  },

  async getVideo(videoId) {
    try {
      const response = await apiClient.get(`/videos/${encodeURIComponent(videoId)}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load video"));
    }
  },

  async saveVideo(teacherId, payload) {
    try {
      const response = await apiClient.post(
        `/teachers/${teacherId}/videos`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save video"));
    }
  },

  async updateVideo(teacherId, videoId, payload) {
    try {
      const response = await apiClient.put(
        `/teachers/${teacherId}/videos/${encodeURIComponent(videoId)}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update video"));
    }
  },

  async deleteVideo(teacherId, videoId) {
    try {
      await apiClient.delete(
        `/teachers/${teacherId}/videos/${encodeURIComponent(videoId)}`
      );
      return true;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to delete video"));
    }
  },
};

export default videoApi;
