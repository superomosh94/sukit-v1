import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultTheme = {
    colors: {
        primary: '#3B82F6',
        secondary: '#38BDF8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#0F172A',
        surface: '#1E293B',
        'surface-light': '#334155',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#334155',
        custom: [],
    },
    typography: {
        base: { fontFamily: 'Inter', fontSize: 16 },
        headings: {
            h1: { fontSize: 48, fontWeight: 700 },
            h2: { fontSize: 36, fontWeight: 700 },
            h3: { fontSize: 28, fontWeight: 600 },
            h4: { fontSize: 24, fontWeight: 600 },
            h5: { fontSize: 20, fontWeight: 500 },
            h6: { fontSize: 18, fontWeight: 500 },
        },
        body: { lineHeight: 1.5, letterSpacing: 0 },
    },
    spacing: {
        base: 4,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
    },
    borderRadius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 24,
        full: 9999,
    },
    shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    },
    isDark: true,
    customCSS: '',
};

export const useThemeStore = create(
    persist(
        (set, get) => ({
            ...defaultTheme,
            
            updateColors: (colors) => set({ colors }),
            updateTypography: (typography) => set({ typography }),
            updateSpacing: (spacing) => set({ spacing }),
            updateBorderRadius: (borderRadius) => set({ borderRadius }),
            updateShadows: (shadows) => set({ shadows }),
            toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),
            setCustomCSS: (customCSS) => set({ customCSS }),
            resetTheme: () => set(defaultTheme),
        }),
        {
            name: 'sukit-theme',
        }
    )
);
