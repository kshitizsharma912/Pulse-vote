import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT automatically to protected requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulsevote_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Convert different FastAPI error shapes into one readable message.
export function getApiError(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail === "object" && detail !== null) {
    return detail.message || JSON.stringify(detail);
  }

  if (error?.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return "Unable to connect to the backend. Make sure FastAPI is running.";
}

export default api;