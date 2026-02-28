import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('vista_token') || null,
    isLoggedIn: !!localStorage.getItem('vista_token'),

    login: (userData, token) => {
        localStorage.setItem('vista_token', token);
        set({ user: userData, token, isLoggedIn: true });
    },

    logout: () => {
        localStorage.removeItem('vista_token');
        set({ user: null, token: null, isLoggedIn: false });
    },

    setUser: (userData) => set({ user: userData })
}));
