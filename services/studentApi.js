import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://16.208.59.201:8080/api",
  ios: "http://16.208.59.201:8080/api",
  default: "http://16.208.59.201:8080/api",
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const studentApi = {
  async registerStudent(payload) {
    try {
      const response = await apiClient.post("/students/register", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Student registration failed"));
    }
  },

  async loginStudent(payload) {
    try {
      const response = await apiClient.post("/students/login", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Student login failed"));
    }
  },

  async getStudentProfile(studentId) {
    try {
      const response = await apiClient.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load student profile"));
    }
  },

  async updateStudentProfile(studentId, payload) {
    try {
      const response = await apiClient.put(`/students/${studentId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update student profile"));
    }
  },

  async uploadStudentAvatar(studentId, fileAsset) {
    try {
      const formData = new FormData();
      const fileName =
        fileAsset?.fileName ||
        fileAsset?.name ||
        `student-avatar-${Date.now()}.jpg`;
      const mimeType = fileAsset?.mimeType || fileAsset?.type || "image/jpeg";

      if (Platform.OS === "web" && fileAsset?.file instanceof File) {
        formData.append("file", fileAsset.file, fileName);
      } else if (Platform.OS === "web" && fileAsset?.uri) {
        const blobResponse = await fetch(fileAsset.uri);
        const blob = await blobResponse.blob();
        formData.append("file", blob, fileName);
      } else {
        formData.append("file", {
          uri: fileAsset?.uri,
          name: fileName,
          type: mimeType,
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/students/${studentId}/avatar`,
        formData,
        {
          timeout: 20000,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to upload avatar"));
    }
  },
};

export default apiClient;
