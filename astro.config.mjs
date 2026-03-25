// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import node from '@astrojs/node'; // Add this line to import the node adapter

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({ 
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321
  },

  vite: {
    plugins: [tailwindcss()]
  }
});