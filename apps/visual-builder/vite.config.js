import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const STUDIO_BASE = '/studio';

export default defineConfig({
    plugins: [react()],
    base: STUDIO_BASE,
    server: {
        port: 5173,
        fs: { allow: ['..'] },
        proxy: {
            '/api': { target: 'http://localhost:3000', changeOrigin: true },
        },
    },
    build: {
        outDir: path.resolve(__dirname, '../../apps/web/public/studio'),
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
    },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    optimizeDeps: {
        exclude: ['react-router-dom'],
    },
});
