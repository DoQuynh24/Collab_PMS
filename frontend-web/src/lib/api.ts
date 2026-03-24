import axios from "axios";
import { COLLAB_URL } from "../constant/config";

export const apiClient = axios.create({
  baseURL: COLLAB_URL,
  timeout: 1000 * 60 * 30 * 3, 
  withCredentials: true,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const status = error?.response?.status;

    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/invitations')) {
        return Promise.reject(error); 
      }
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
      
    if (status === 403) {
      return Promise.reject({
        message: "No access to COLLAB system",
        code: 403,
        custom: true,
      });
    }

    if (status === 404) {
      return Promise.reject({
        message: "Not Found",
        code: 404,
        custom: true,
        data: error.response?.data,
      });
    }

    if (status === 500) {
      return Promise.reject({
        message: "Internal Server Error",
        code: 500,
        custom: true,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;