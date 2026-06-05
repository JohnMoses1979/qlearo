import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://192.168.0.29:8085/api",
  ios: "http://192.168.0.29:8085/api",
  default: "http://192.168.0.29:8085/api",
});

export const TEACHER_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: TEACHER_API_BASE_URL,
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

  if (status === 409) {
    if (/email/i.test(rawMessage)) {
      return "This email is already registered. Try logging in instead.";
    }

    if (/phone/i.test(rawMessage) || /mobile/i.test(rawMessage)) {
      return "This phone number is already registered. Try logging in instead.";
    }

    return "This account already exists. Try logging in instead.";
  }

  return rawMessage;
};

export const teacherApi = {
  async initiateRegistration(payload) {
    try {
      const response = await apiClient.post("/teachers/register/initiate", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to send OTP"));
    }
  },

  async verifyRegistrationOtp(payload) {
    try {
      const response = await apiClient.post("/teachers/register/verify-otp", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Invalid OTP"));
    }
  },

  async completeRegistration(payload) {
    try {
      console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));
      const response = await apiClient.post("/teachers/register/complete", payload);
      return response.data;
    } catch (error) {
      console.log("400 ERROR DETAILS:", JSON.stringify(error?.response?.data, null, 2));
      throw new Error(getMessage(error, "Unable to complete teacher registration"));
    }
  },

  async login(payload) {
    try {
      const response = await apiClient.post("/teachers/login", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to login"));
    }
  },

  async forgotPassword(payload) {
    try {
      const response = await apiClient.post("/teachers/password/forgot", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to send reset code"));
    }
  },

  async resetPassword(payload) {
    try {
      const response = await apiClient.post("/teachers/password/reset", payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to reset password"));
    }
  },

  async getProfile(teacherId) {
    try {
      const response = await apiClient.get(`/teachers/${teacherId}`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load teacher profile"));
    }
  },

  async updateProfile(teacherId, payload) {
    try {
      const response = await apiClient.put(`/teachers/${teacherId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update teacher profile"));
    }
  },

  async uploadAvatar(teacherId, fileAsset) {
    try {
      const formData = new FormData();
      const fileName =
        fileAsset?.fileName ||
        fileAsset?.name ||
        `teacher-avatar-${Date.now()}.jpg`;
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
        `${TEACHER_API_BASE_URL}/teachers/${teacherId}/avatar`,
        formData,
        { timeout: 20000 }
      );

      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to upload avatar"));
    }
  },

  async getTeachersByStatus(status = "PENDING_APPROVAL") {
    try {
      const response = await apiClient.get("/admin/teachers", {
        params: { status },
      });
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load teacher approvals"));
    }
  },

  async approveTeacher(teacherId) {
    try {
      const response = await apiClient.post(`/admin/teachers/${teacherId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to approve teacher"));
    }
  },

  async rejectTeacher(teacherId) {
    try {
      const response = await apiClient.post(`/admin/teachers/${teacherId}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(getMessage(error, "Unable to reject teacher"));
    }
  },
};

export default teacherApi;
