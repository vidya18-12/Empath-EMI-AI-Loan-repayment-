import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses and global errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.response?.data?.message || 'A server error occurred';

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (status === 400) {
            // Show toast for Bad Request errors if not already handled
            toast.error(`Request Error: ${message}`, {
                id: 'global-400-error', // Prevent duplicate toasts
                duration: 4000
            });
        } else if (status >= 500) {
            toast.error('Internal Server Error. Please contact support.');
        }

        return Promise.reject(error);
    }
);

export default api;
