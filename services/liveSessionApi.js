import axios from "axios";
import { TUITION_API_BASE_URL } from "./tuitionApi";

const liveSessionApiClient = axios.create({
  baseURL: TUITION_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const toWsBaseUrl = (baseUrl) => {
  const withoutApi = String(baseUrl || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  if (withoutApi.startsWith("https://")) {
    return withoutApi.replace(/^https:\/\//i, "wss://");
  }

  if (withoutApi.startsWith("http://")) {
    return withoutApi.replace(/^http:\/\//i, "ws://");
  }

  return `ws://${withoutApi}`;
};

const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
};

export const buildLiveSessionWsUrl = (sessionId, params = {}) => {
  const query = buildQueryString({
    sessionId,
    ...params,
  });

  return `${toWsBaseUrl(TUITION_API_BASE_URL)}/ws/live-session${query ? `?${query}` : ""}`;
};

export const fetchLiveSessionMessages = async (sessionId) => {
  const response = await liveSessionApiClient.get(`/live-sessions/${sessionId}/messages`);
  return response.data;
};

export const postLiveSessionMessage = async (sessionId, payload = {}) => {
  const response = await liveSessionApiClient.post(`/live-sessions/${sessionId}/messages`, payload);
  return response.data;
};

