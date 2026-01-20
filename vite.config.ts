import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5000,
        allowedHosts: true,
    },
    css: {
        postcss: './postcss.config.js',
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-avatar'],
                    'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
                    'vendor-utils': ['date-fns', 'dayjs', 'clsx', 'tailwind-merge', 'zod'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                    'vendor-pdf': ['jspdf', 'html2canvas'],
                },
            },
        },
    },
})
