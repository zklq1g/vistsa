import { create } from 'zustand';

export const useErrorStore = create((set) => ({
    isOpen: false,
    errorData: null,

    showError: (error) => set({
        isOpen: true,
        errorData: {
            status: error.status || 'Error',
            message: error.message || 'An unexpected error occurred.',
            endpoint: error.endpoint || null,
            method: error.method || null,
            raw: error.raw || null
        }
    }),

    hideError: () => set({ isOpen: false, errorData: null })
}));
