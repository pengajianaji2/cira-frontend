import axios from "axios";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  let productionApiUrl: URL;
  try {
    if (!configuredApiUrl) throw new Error("missing");
    productionApiUrl = new URL(configuredApiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid HTTPS API URL in production builds.");
  }
  if (productionApiUrl.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(productionApiUrl.hostname)) {
    throw new Error("NEXT_PUBLIC_API_URL must point to a public HTTPS API in production builds.");
  }
}
const API_BASE_URL = configuredApiUrl || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfRequest: Promise<string> | undefined;
let csrfTokenCache: string | undefined;
let csrfTokenExpiresAt = 0;

async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache && Date.now() < csrfTokenExpiresAt) return csrfTokenCache;
  csrfRequest ||= axios
    .get<{ data: { token: string } }>(`${API_BASE_URL}/auth/csrf`, { withCredentials: true })
    .then((response) => {
      csrfTokenCache = response.data.data.token;
      csrfTokenExpiresAt = Date.now() + 50 * 60 * 1000;
      return csrfTokenCache;
    })
    .finally(() => { csrfRequest = undefined; });
  return csrfRequest;
}

apiClient.interceptors.request.use(async (config) => {
  // Fetch & set CSRF token for cookie-authenticated mutations.
  if (["post", "put", "patch", "delete"].includes((config.method || "get").toLowerCase())) {
    config.headers.set("X-CSRF-Token", await getCsrfToken());
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (typeof error.config & { _csrfRetried?: boolean }) | undefined;
    const responseMessage = error.response?.data?.message;
    if (
      error.response?.status === 403 &&
      typeof responseMessage === "string" &&
      responseMessage.toLowerCase().includes("csrf") &&
      config &&
      !config._csrfRetried
    ) {
      config._csrfRetried = true;
      csrfTokenCache = undefined;
      csrfTokenExpiresAt = 0;
      return apiClient.request(config);
    }
    // Tangani error HTTP terpusat
    const message =
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada server.";
    const normalized = new Error(message) as Error & { status?: number; code?: string };
    normalized.status = error.response?.status;
    normalized.code = error.response?.data?.code;
    return Promise.reject(normalized);
  }
);
