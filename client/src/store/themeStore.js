import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    theme: 'dark', // Default elite aesthetics
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),
    setTheme: (theme) => set(() => {
        document.documentElement.setAttribute('data-theme', theme);
        return { theme };
    })
}));
