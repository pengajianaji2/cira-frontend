import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfRequest: Promise<string> | undefined;
apiClient.interceptors.request.use(async (config) => {
  if (["post", "put", "patch", "delete"].includes((config.method || "get").toLowerCase())) {
    csrfRequest ||= axios
      .get<{ data: { token: string } }>(`${API_BASE_URL}/auth/csrf`, { withCredentials: true })
      .then((response) => response.data.data.token)
      .finally(() => { csrfRequest = undefined; });
    config.headers.set("X-CSRF-Token", await csrfRequest);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangani error HTTP terpusat
    const message =
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada server.";
    return Promise.reject(new Error(message));
  }
);
