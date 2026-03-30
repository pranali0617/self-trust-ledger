import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {IncomingMessage, ServerResponse} from 'node:http';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {generateChatResponse} from './src/server/chat';

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-chat-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method !== 'POST') {
              res.setHeader('Allow', 'POST');
              sendJson(res, 405, {error: 'Method not allowed'});
              return;
            }

            try {
              const body = await readJsonBody(req);
              const result = await generateChatResponse(body, env);
              sendJson(res, result.status, result.body);
            } catch (error) {
              console.error('Local chat API error:', error);
              sendJson(res, 500, {error: 'Failed to handle local chat request'});
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify; file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
