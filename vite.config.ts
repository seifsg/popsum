import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Strict CSP, built app only: Vite dev injects <style> tags this policy would block.
const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const csp: Plugin = {
  name: 'popsum-csp',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
  ],
};

export default defineConfig({
  base: './',
  server: { port: 4317, strictPort: true },
  preview: { port: 4318, strictPort: true },
  plugins: [
    csp,
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Popsum',
        short_name: 'Popsum',
        description: 'Pop the balloon with the right answer: a calm math game for kids.',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#e0f2fe',
        theme_color: '#38bdf8',
        categories: ['education', 'games', 'kids'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'], cleanupOutdatedCaches: true },
    }),
  ],
});
