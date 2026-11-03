import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath, URL } from 'node:url';

const fromRoot = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Serves /api/llm/config in dev, mirroring the Nginx location used in Docker.
// Only the model name is exposed; the endpoint and key stay server-side.
const liveAiConfig = (model: string): Plugin => ({
  name: 'edulink-live-ai-config',
  configureServer(server) {
    server.middlewares.use('/api/llm/config', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ kimi: { model } }));
    });
  },
});

export default defineConfig(({ mode }) => {
  // Reads .env (git-ignored) next to this file; shell variables take priority.
  const env = loadEnv(mode, fromRoot('.'), '');
  const kimiBase = env.KIMI_BASE_URL?.trim();
  const kimiModel = kimiBase ? env.KIMI_MODEL_NAME?.trim() ?? '' : '';

  return {
    plugins: [react(), liveAiConfig(kimiModel)],
    resolve: {
      alias: { '@': fromRoot('./src') },
    },
    // PostCSS is configured inline so styles resolve correctly regardless of the launch directory.
    css: {
      postcss: {
        plugins: [tailwindcss({ config: fromRoot('./tailwind.config.js') }), autoprefixer()],
      },
    },
    server: {
      port: 5173,
      proxy: kimiBase
        ? {
            '/api/llm/kimi': {
              target: kimiBase,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/llm\/kimi/, ''),
              headers: { Authorization: `Bearer ${env.KIMI_API_KEY ?? ''}` },
              timeout: 180_000,
              proxyTimeout: 180_000,
            },
          }
        : undefined,
    },
  };
});
