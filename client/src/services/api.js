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

        if (status === 401) {
            // Auto logout on token expiration
            useAuthStore.getState().logout();
            if (window.location.pathname !== '/login') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        } else if (status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else {
            // Unhandled 400 or 500+ series errors trigger the Global Error Modal
            toast.error(status >= 500 ? 'Server error. Additional details in popup.' : message);

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
