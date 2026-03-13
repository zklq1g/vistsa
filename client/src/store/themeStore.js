import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
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
        }),
        {
            name: 'vista-theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme immediately after rehydration
                if (state) {
                    document.documentElement.setAttribute('data-theme', state.theme);
                }
            }
        }
    )
);
