import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useErrorStore } from '../store/errorStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (inject JWT)
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (handle auth errors globally)
api.interceptors.response.use(
    (response) => response.data, // Strip axios wrapper, return our formatted data
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'Something went wrong';


        // Push full debug info to the global error store to show the modal
        useErrorStore.getState().showError({
            status,
            message,
            endpoint: error.config?.url,
            method: error.config?.method,
            raw: error.response?.data || error.message
        });
    }

return Promise.reject(error.response?.data || { message });
    }
);

export default api;
