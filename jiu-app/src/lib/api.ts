import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Create Axios instance
const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Response interceptor to handle errors and auto-refresh token (401)
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

        // If no response or not a 401 error, reject immediately
        if (!error.response || error.response.status !== 401 || !originalRequest) {
            return Promise.reject(error);
        }

        // Avoid infinite refresh loops: do not intercept refresh, login, or register calls
        const requestUrl = originalRequest.url || "";
        const isAuthRoute =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/register") ||
            requestUrl.includes("/auth/refresh");

        if (isAuthRoute || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // If refresh is already in progress, enqueue this request
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Attempt silent refresh via backend using clean unintercepted axios call
            await axios.post("/api/auth/refresh", {}, { withCredentials: true });

            // On success, process any queued requests
            processQueue(null);

            // Retry the original request
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh token has expired or is invalid
            processQueue(refreshError);

            // Clean up stored state and redirect to login if running in browser
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                // Only redirect if not already on an auth page
                const currentPath = window.location.pathname;
                if (!currentPath.includes("/login") && !currentPath.includes("/register") && !currentPath.includes("/forgot-password")) {
                    window.location.href = "/login";
                }
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
