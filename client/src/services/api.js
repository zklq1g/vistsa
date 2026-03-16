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
        console.log(`VISTA API [REQ]: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (handle auth errors globally)
api.interceptors.response.use(
    (response) => {
        console.log(`VISTA API [RES]: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'Something went wrong';
        console.error(`VISTA API [ERR]: ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${status}`, error.response?.data || error.message);

        if (status === 401) {
            // Auto logout on token expiration
            useAuthStore.getState().logout();
            if (window.location.pathname !== '/login') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        } else if (status === 404) {
            // 404s are expected for some calls (e.g. /auth/me with expired token).
            // Don't show a toast or modal — just silently reject.
            console.warn(`VISTA: 404 on ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        } else {
            // Unhandled 400, 403, or 500+ series errors trigger the Global Error Modal
            let toastMsg = message;
            if (status === 403) toastMsg = 'Permission denied. Details in popup.';
            if (status >= 500) toastMsg = 'Server error. Details in popup.';

            toast.error(toastMsg);

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
