import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('vista_user')) || null,
    token: localStorage.getItem('vista_token') || null,
    isLoggedIn: !!localStorage.getItem('vista_token'),

    login: (userData, token) => {
        localStorage.setItem('vista_token', token);
        localStorage.setItem('vista_user', JSON.stringify(userData));
        set({ user: userData, token, isLoggedIn: true });
    },

    logout: () => {
        localStorage.removeItem('vista_token');
        localStorage.removeItem('vista_user');
        set({ user: null, token: null, isLoggedIn: false });
    },

    setUser: (userData) => {
        localStorage.setItem('vista_user', JSON.stringify(userData));
        set({ user: userData });
    }
}));
