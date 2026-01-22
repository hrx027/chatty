import axios from 'axios';

const getApiBaseUrl = () => {
    if (import.meta.env.MODE === "development") {
        return "http://" + window.location.hostname + ":5001/api";
    }

    const base = import.meta.env.VITE_API_URL;
    if (!base) return "/api";

    return base.replace(/\/$/, "") + "/api";
};

export const axiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
