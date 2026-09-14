import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_GATEWAY_URL } from '../config/authConfig';

const axiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const oidcStorageKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith('oidc.user:')
    );

    if (oidcStorageKey) {
      const oidcRawData = sessionStorage.getItem(oidcStorageKey);
      if (oidcRawData) {
        const user = JSON.parse(oidcRawData);
        if (user?.access_token) {
          config.headers.set('Authorization', `Bearer ${user.access_token}`);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;