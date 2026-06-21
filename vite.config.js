import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';
import fs from 'fs';
import path from 'path';

// Proxy mTLS: o Vite apresenta o certificado app.crt ao backend em nome do browser
function mtlsAgent() {
  try {
    return new https.Agent({
      cert: fs.readFileSync(path.resolve('certs/app.crt')),
      key:  fs.readFileSync(path.resolve('certs/app.key')),
      ca:   fs.readFileSync(path.resolve('certs/ca.crt')),
      rejectUnauthorized: false,
    });
  } catch {
    console.warn('[vite] certs/ não encontrados — copie app.crt, app.key e ca.crt para ./certs/');
    return undefined;
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
        agent: mtlsAgent(),
      },
    },
  },
});
