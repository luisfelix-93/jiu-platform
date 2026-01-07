import axios from "axios";

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor removed as cookies are handled automatically

// Response interceptor to handle errors (e.g., 401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Optional: Dispatch logout action or redirect to login
            // For now, just reject, app will handle redirect
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;
