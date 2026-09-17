import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    // Keep CRA's output folder so the Netlify publish directory doesn't change.
    outDir: 'build',
    // three.js alone is ~515 kB minified; it only loads on the simulator routes.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // A stable, separately cached chunk for three.js, which changes far less often than the app.
        codeSplitting: { groups: [{ name: 'three', test: /node_modules[\\/]three[\\/]/ }] },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
