import axios from "axios";
import { Platform } from "react-native";

const FALLBACK_API_BASE_URL = Platform.select({
  android: "http://192.168.0.29:8085/api",
  ios: "http://192.168.0.29:8085/api",
  default: "http://192.168.0.29:8085/api",
});

export const SUBSCRIPTION_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

const apiClient = axios.create({
  baseURL: SUBSCRIPTION_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const unwrap = (response) => response?.data ?? response;

export const subscriptionApi = {
  async getAllPayments() {
    try {
      const response = await apiClient.get("/subscription-payments");
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load subscription payments"));
    }
  },

  async getStudentPayments(studentId) {
    try {
      const response = await apiClient.get(`/students/${studentId}/subscription-payments`);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to load student subscription payments"));
    }
  },

  async createPayment(payload) {
    try {
      const response = await apiClient.post("/subscription-payments", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to save subscription payment"));
    }
  },

  async deletePayment(paymentId) {
    try {
      const response = await apiClient.delete(`/subscription-payments/${paymentId}`);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to delete subscription payment"));
    }
  },

  async createRazorpayOrder(payload) {
    try {
      const response = await apiClient.post("/subscriptions/razorpay/order", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to create Razorpay order"));
    }
  },

  async createWithdrawalRazorpayOrder(payload) {
    try {
      const response = await apiClient.post("/razorpay/order", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to create withdrawal Razorpay order"));
    }
  },

  async verifyRazorpayPayment(payload) {
    try {
      const response = await apiClient.post("/subscriptions/razorpay/verify", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(getMessage(error, "Unable to verify Razorpay payment"));
    }
  },
};

export default subscriptionApi;
