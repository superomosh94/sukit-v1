/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: { 500: '#3B82F6', 600: '#2563EB' },
                secondary: { 500: '#38BDF8' },
                success: { 500: '#10B981' },
                warning: { 500: '#F59E0B' },
                danger: { 500: '#EF4444' },
                background: '#0F172A',
                surface: '#1E293B',
                'surface-light': '#334155',
                'text-primary': '#F8FAFC',
                'text-secondary': '#94A3B8',
                border: '#334155',
            },
        },
    },
    plugins: [],
};
