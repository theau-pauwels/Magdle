// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(), // <-- Cette ligne est CRUCIALE
    react()     // <-- Celle-ci aussi pour ton jeu
  ],
});