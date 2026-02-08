import axios from "axios";
import { API_URL } from "@/lib/constant";
import { type ApiErrorResponse } from "@/lib/type";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("access_token") || "";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  function onFulfilled(response) {
    const responseObject = { ...response.data };
    return responseObject;
  },
  function onRejected(error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: error.response?.data?.statusCode || 500,
      message: error.response?.data?.message || "An error occurred",
      errors: error.response?.data?.errors || [],
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };
    return Promise.reject(errorResponse);
  },
);

export default api;
