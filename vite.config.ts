import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath, URL } from 'node:url';

const fromRoot = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fromRoot('./src') },
  },
  // PostCSS is configured inline so styles resolve correctly regardless of the launch directory.
  css: {
    postcss: {
      plugins: [tailwindcss({ config: fromRoot('./tailwind.config.js') }), autoprefixer()],
    },
  },
  server: { port: 5173 },
});
