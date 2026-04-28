import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Local dev: leave VITE_API_URL unset so the browser calls /api and this proxy forwards to the backend.
// Production: set VITE_API_URL to your API origin (see frontend/.env.example).
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
