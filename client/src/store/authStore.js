import { create } from 'zustand';

export const normalizeRole = (role) => {
    if (!role) return '';
    // Remove underscores/spaces and convert to uppercase: "SYSTEM_ADMIN" -> "SYSTEMADMIN"
    return role.toString().replace(/[\s_]/g, '').toUpperCase();
};

const getInitialUser = () => {
    try {
        const saved = localStorage.getItem('vista_user');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        return null;
    }
};

export const useAuthStore = create((set) => ({
    user: getInitialUser(),
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
