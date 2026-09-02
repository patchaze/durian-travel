import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://www.duriantravel.com',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        page !== 'https://www.duriantravel.com/404/' &&
        page !== 'https://www.duriantravel.com/terms-of-service/' &&
        page !== 'https://www.duriantravel.com/privacy-policy/' &&
        page !== 'https://www.duriantravel.com/cookie-policy/' &&
        page !== 'https://www.duriantravel.com/disclaimer/' &&
        page !== 'https://www.duriantravel.com/thank-you/' &&
        page !== 'https://www.duriantravel.com/about/'
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Keep each page's CSS separate to avoid cross-page CSS loading
            if (id.includes('src/pages/')) {
              const match = id.match(/src\/pages\/([^/]+)/);
              if (match) return `page-${match[1].replace(/\./g, '_')}`;
            }
          }
        }
      }
    },
  },
});
